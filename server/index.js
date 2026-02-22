const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

require("dotenv").config();
const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext)
  }
});

const upload = multer({ storage: storage });

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000", 
      "http://localhost:5173", 
      "http://localhost:5174"
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const user = await client.db("research").collection("user");
    const doctors = await client.db("research").collection("doctors");
    const bookedServices = await client.db("research").collection("bookedServices");
    const papers = await client.db("research").collection("papers"); // Explicitly defined now
    const reviews = await client.db("research").collection("reviews");
    const journals = await client.db("research").collection("journals");
    const departments = await client.db("research").collection("departments"); // New Collection
    const volumes = await client.db("research").collection("volumes");
    const issues = await client.db("research").collection("issues");

    // --- SEED ADMIN USER ---
    const adminEmail = "mdyeamen611@gmail.com";
    const existingAdmin = await user.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("123456", 10);
      await user.insertOne({
        name: "Super Admin",
        email: adminEmail,
        password: hashedPassword,
        roles: ["Admin"], // Update to array
        isVerified: true,
        department: "Administration",
        createdAt: new Date(),
      });
      console.log("Admin user seeded successfully");
    }

    // --- SEED DEFAULT PUBLISHER ---
    const publisherEmail = "publisher@test.com";
    const existingPublisher = await user.findOne({ email: publisherEmail });
    if (!existingPublisher) {
      const hashedPassword = await bcrypt.hash("123456", 10);
      await user.insertOne({
        name: "Publisher",
        email: publisherEmail,
        password: hashedPassword,
        roles: ["Publisher"], 
        isVerified: true,
        department: "Publication",
        createdAt: new Date(),
      });
      console.log("Publisher user seeded successfully");
    }

    // --- SEED DEFAULT JOURNAL ---
    const existingJournal = await journals.findOne({ name: "Journal of Computer Science and Technology" });
    if (!existingJournal) {
      await journals.insertOne({
        name: "Journal of Computer Science and Technology",
        faculty: "Engineering",
        department: "Computer Science (CSE)", // Maps to our constants
        eicId: null, // To be assigned
        eicName: "Unassigned",
        description: "Premier journal for CS research.",
        createdAt: new Date()
      });
      console.log("Default journal seeded");
    }

    // --- ARCHIVE SYSTEM (VOLUMES & ISSUES) ---

    // Get All Volumes (Optionally filtered by journal)
    app.get("/volumes", async (req, res) => {
      try {
        const { journalId } = req.query;
        const query = journalId ? { journalId } : {};
        const allVolumes = await volumes.find(query).sort({ year: -1 }).toArray();
        res.json(allVolumes);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch volumes" });
      }
    });

    // Create Volume
    app.post("/volumes", async (req, res) => {
      try {
        const { year, journalId } = req.body;
        if (!year) return res.status(400).json({ error: "Year is required" });
        if (!journalId) return res.status(400).json({ error: "Journal ID is required" });
        
        const existing = await volumes.findOne({ year: parseInt(year), journalId: journalId });
        if (existing) return res.status(400).json({ error: "Volume for this year already exists in this journal" });

        const newVolume = {
          year: parseInt(year),
          journalId: journalId,
          createdAt: new Date(),
          isActive: true
        };
        
        await volumes.insertOne(newVolume);
        res.json({ message: "Volume created successfully", volume: newVolume });
      } catch (error) {
        res.status(500).json({ error: "Failed to create volume" });
      }
    });

    // Get Issues for a Volume
    app.get("/volumes/:id/issues", async (req, res) => {
      try {
        const volumeId = req.params.id;
        const volumeIssues = await issues.find({ volumeId: volumeId }).sort({ issueNumber: 1 }).toArray();
        res.json(volumeIssues);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch issues" });
      }
    });

    // Create Issue
    app.post("/issues", async (req, res) => {
      try {
        const { volumeId, title, issueNumber, coverImageUrl } = req.body;
        if (!volumeId || !title || !issueNumber) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        const newIssue = {
          volumeId,
          title,
          issueNumber: parseInt(issueNumber),
          coverImageUrl: coverImageUrl || null,
          isPublished: false,
          createdAt: new Date()
        };

        const result = await issues.insertOne(newIssue);
        res.json({ message: "Issue created successfully", issueId: result.insertedId });
      } catch (error) {
        res.status(500).json({ error: "Failed to create issue" });
      }
    });

    // Publish Issue (Optional: Mark issue as published)
    app.put("/issues/:id/publish", async (req, res) => {
      try {
        const issueId = req.params.id;
        await issues.updateOne(
          { _id: new ObjectId(issueId) },
          { $set: { isPublished: true, publishedAt: new Date() } }
        );
        res.json({ message: "Issue published" });
      } catch (error) {
        res.status(500).json({ error: "Failed to publish issue" });
      }
    });
    
    // Get Papers by Issue
    app.get("/issues/:id/papers", async (req, res) => {
       try {
         const issueId = req.params.id;
         const issuePapers = await papers.find({ issueId: issueId, status: "Published" }).toArray();
         res.json(issuePapers);
       } catch (error) {
         res.status(500).json({ error: "Failed to fetch papers for issue" });
       }
    });

    // Assign Paper to Issue and Publish
    app.put("/papers/:id/assign-issue", async (req, res) => {
        try {
            const paperId = req.params.id;
            const { issueId } = req.body;
            
            if (!issueId) return res.status(400).json({ error: "Issue ID is required" });

            await papers.updateOne(
                { _id: new ObjectId(paperId) },
                { $set: { issueId: issueId, status: "Published", publishedDate: new Date() } }
            );
            
            // Notify Author of Publication
            await notifyPaperAuthors(
               paperId,
               "Paper Published",
               "Congratulations! Your paper has been assigned to an issue and is now officially published.",
               "success"
            );

            res.json({ message: "Paper assigned to issue and published" });
        } catch (error) {
            res.status(500).json({ error: "Failed to assign paper" });
        }
    });

    // --- SEED DEPARTMENTS ---
    const existingDepts = await departments.countDocuments();
    if (existingDepts === 0) {
      const deptList = [
        'Computer Science (CSE)',
        'Electrical Engineering (EEE)',
        'Business Administration (BBA)',
        'English Literature',
        'Civil Engineering',
        'Mechanical Engineering',
        'Physics',
        'Mathematics',
        'Chemistry',
        'Economics',
        'Law',
        'Architecture'
      ];
      await departments.insertMany(deptList.map(name => ({ name, createdAt: new Date() })));
      console.log("Departments seeded");
    }

    // Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // --- NOTIFICATION SYSTEM ---
    const notifications = client.db("research").collection("notifications");

    // Helper: Create Notification (In-App Only)
    const createNotification = async (userId, title, message, type, relatedId = null) => {
       try {
         await notifications.insertOne({
           userId: new ObjectId(userId), // Target User
           title,
           message,
           type, // 'info', 'success', 'warning', 'error'
           relatedId: relatedId ? new ObjectId(relatedId) : null,
           isRead: false,
           createdAt: new Date()
         });
       } catch (err) {
         console.error("Failed to create notification:", err);
       }
    };

    // Helper: Create Notification and Send Email
    const createAndSendNotification = async (userId, userEmail, userName, title, message, type, relatedId = null) => {
      // 1. Create In-App Notification
      await createNotification(userId, title, message, type, relatedId);

      // 2. Send Email
      if (userEmail) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: userEmail,
          subject: title,
          text: `Hello ${userName || 'User'},\n\n${message}\n\nBest regards,\nEditorial Team\nBarishal University Research Portal`
        };

        try {
          if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail(mailOptions);
            console.log(`[Notification Email] Sent to ${userEmail}: ${title}`);
          } else {
            console.log(`[DEV MODE - Notification Email] To ${userEmail}: ${title}`);
          }
        } catch (error) {
          console.error(`[Error sending notification email to ${userEmail}]:`, error.message);
        }
      }
    };
    
    // Helper: Notify All Editors
    const notifyAllEditors = async (message, type, relatedId = null, title = "System Notification") => {
       try {
          const editors = await user.find({ roles: "Editor" }).toArray();
          for (const editor of editors) {
             await createAndSendNotification(editor._id, editor.email, editor.name, title, message, type, relatedId);
          }
       } catch (err) {
          console.error("Failed to notify editors:", err);
       }
    };

    // Endpoint: Get Unread Count
    app.get("/notifications/unread-count", async (req, res) => {
       try {
          const userId = req.query.userId;
          if (!userId) return res.json({ count: 0 });
          
          const count = await notifications.countDocuments({ 
             userId: new ObjectId(userId), 
             isRead: false 
          });
          res.json({ count });
       } catch (error) {
          res.status(500).json({ error: "Failed to fetch count" });
       }
    });

    // Endpoint: Get Notifications
    app.get("/notifications/:userId", async (req, res) => {
       try {
          const userId = req.params.userId;
          if (!userId) return res.json([]);
          
          const notifs = await notifications.find({ userId: new ObjectId(userId) })
             .sort({ createdAt: -1 })
             .limit(50)
             .toArray();
          res.json(notifs);
       } catch (error) {
          res.status(500).json({ error: "Failed to fetch notifications" });
       }
    });

    // Endpoint: Mark Multiple as Read
    app.put("/notifications/mark-read", async (req, res) => {
       try {
          const { userId, notificationIds } = req.body;
          if (!userId || !notificationIds || !Array.isArray(notificationIds)) {
              return res.status(400).json({ error: "Invalid request body" });
          }

          const objectIds = notificationIds.map(id => new ObjectId(id));

          await notifications.updateMany(
             { _id: { $in: objectIds }, userId: new ObjectId(userId) },
             { $set: { isRead: true } }
          );
          res.json({ success: true });
       } catch (error) {
          console.error("Mark Read Error:", error);
          res.status(500).json({ error: "Failed to mark notifications read" });
       }
    });

    // Endpoint: Mark single as Read
    app.put("/notifications/:id/read", async (req, res) => {
       try {
          await notifications.updateOne(
             { _id: new ObjectId(req.params.id) },
             { $set: { isRead: true } }
          );
          res.json({ success: true });
       } catch (error) {
          res.status(500).json({ error: "Failed to update notification" });
       }
    });
    
    // Endpoint: Mark All Read
    app.put("/notifications/read-all", async (req, res) => {
       try {
          const { userId } = req.body;
          if (!userId) return res.status(400).json({ error: "User ID required" });
          
          await notifications.updateMany(
             { userId: new ObjectId(userId), isRead: false },
             { $set: { isRead: true } }
          );
          res.json({ success: true });
       } catch (error) {
           res.status(500).json({ error: "Failed to mark all read" });
       }
    });


    // --- SEED DEMO USERS (DISABLED) ---
    // const demoUserCount = await user.countDocuments({ email: { $regex: 'demo' } });
    // if (demoUserCount === 0) {
    //   console.log("Seeding 20 demo users...");
    //   const roles = ['Author', 'Reviewer', 'Editor', 'Admin'];
    //   const demoUsers = [];
    //   const commonPassword = await bcrypt.hash("123456", 10);

    //   for (let i = 1; i <= 20; i++) {
    //     // Distribute roles: 
    //     // 1-10: Authors
    //     // 11-15: Reviewers
    //     // 16-18: Editors
    //     // 19-20: Admins
    //     let role = 'Author';
    //     if (i > 10 && i <= 15) role = 'Reviewer';
    //     else if (i > 15 && i <= 18) role = 'Editor';
    //     else if (i > 18) role = 'Admin';

    //     demoUsers.push({
    //       name: `Demo User ${i} (${role})`,
    //       email: `demo${i}@example.com`,
    //       password: commonPassword,
    //       roles: [role],
    //       isVerified: true,
    //       department: i % 2 === 0 ? "Computer Science (CSE)" : "Electrical Engineering (EEE)", // Varied departments
    //       institution: "Demo University",
    //       createdAt: new Date()
    //     });
    //   }
    //   await user.insertMany(demoUsers);
    //   console.log("20 Demo users seeded successfully.");
    // }

    // Register Endpoint
    app.post("/register", async (req, res) => {
      try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await user.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate Verification Code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const newUser = {
          name,
          email,
          password: hashedPassword,
          roles: ["Author"], // Default role as array
          isVerified: false,
          verificationCode,
          createdAt: new Date(),
        };

        const result = await user.insertOne(newUser);

        // Send Email
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Verify your email",
          text: `Your verification code is: ${verificationCode}`,
        };

        try {
          if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail(mailOptions);
            console.log(`Verification email sent to ${email}`);
          } else {
            console.log(`[DEV MODE] Verification Code for ${email}: ${verificationCode}`);
          }
        } catch (emailError) {
          console.error("Error sending email:", emailError);
          // Don't fail the request if email fails, just log it.
          console.log(`[Backup] Verification Code for ${email}: ${verificationCode}`);
        }

        // --- MERGE PROFILE WITH CO-AUTHOR ENTRIES ---
        // Find papers where this email is listed as an unregistered co-author
        try {
           const updateResult = await papers.updateMany(
              { "coAuthors.email": email },
              { 
                 $set: { 
                    "coAuthors.$[elem].userId": result.insertedId,
                    "coAuthors.$[elem].isRegistered": true
                 } 
              },
              {
                 arrayFilters: [{ "elem.email": email }]
              }
           );
           console.log(`Merged profile for ${email}: Updated ${updateResult.modifiedCount} papers.`);
        } catch (mergeError) {
           console.error("Failed to merge co-author profile", mergeError);
        }

        res.status(201).json({ message: "User registered successfully. Please verify your email.", userId: result.insertedId });
      } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Failed to register user" });
      }
    });

    // Verify Email Endpoint
    app.post("/verify-email", async (req, res) => {
      try {
        const { email, code } = req.body;
        const foundUser = await user.findOne({ email });

        if (!foundUser) {
          return res.status(400).json({ message: "User not found" });
        }

        if (foundUser.isVerified) {
          return res.status(400).json({ message: "User already verified" });
        }

        if (foundUser.verificationCode !== code) {
          return res.status(400).json({ message: "Invalid verification code" });
        }

        await user.updateOne(
          { _id: foundUser._id },
          { $set: { isVerified: true, verificationCode: null } }
        );

        res.json({ message: "Email verified successfully" });
      } catch (error) {
        console.error("Verify Error", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // Forgot Password
    app.post("/auth/forgot-password", async (req, res) => {
      try {
        const { email } = req.body;
        const foundUser = await user.findOne({ email });
        
        if (!foundUser) {
          return res.status(404).json({ message: "User not found" });
        }

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

        await user.updateOne(
          { email },
          { $set: { passwordResetCode: resetCode, passwordResetExpires: resetExpires } }
        );

        // Send Email
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Password Reset Request",
          text: `Your password reset code is: ${resetCode}. It expires in 15 minutes.`,
        };

        try {
           if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
             await transporter.sendMail(mailOptions);
           }
           // Always log for dev/demo context
           console.log(`[RESET PASSWORD] Code for ${email}: ${resetCode}`);
        } catch (error) {
           console.error("Email send failed", error);
           console.log(`[BACKUP] Code for ${email}: ${resetCode}`);
        }

        res.json({ message: "Reset code sent to email" });
      } catch (error) {
        res.status(500).json({ error: "Failed to process request" });
      }
    });

    // Reset Password
    app.post("/auth/reset-password", async (req, res) => {
      try {
        const { email, code, newPassword } = req.body;
        const foundUser = await user.findOne({ email });

        if (!foundUser) return res.status(404).json({ message: "User not found" });
        if (foundUser.passwordResetCode !== code) return res.status(400).json({ message: "Invalid code" });
        if (foundUser.passwordResetExpires && foundUser.passwordResetExpires < Date.now()) {
            return res.status(400).json({ message: "Code expired" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.updateOne(
            { email },
            { 
               $set: { password: hashedPassword },
               $unset: { passwordResetCode: "", passwordResetExpires: "" }
            }
        );

        res.json({ message: "Password reset successful" });
      } catch (error) {
        res.status(500).json({ error: "Failed to reset password" });
      }
    });

    // Login Endpoint
    app.post("/login", async (req, res) => {
      try {
        const { email, password } = req.body;

        // Find user
        const foundUser = await user.findOne({ email });
        if (!foundUser) {
          return res.status(400).json({ message: "Invalid credentials" });
        }

        // Check verification status
        if (!foundUser.isVerified) {
          return res.status(403).json({ message: "Please verify your email first", isNotVerified: true });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, foundUser.password);

        if (!isMatch) {
          return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate tokens
        const accessToken = jwt.sign(
          { userId: foundUser._id, email: foundUser.email },
          process.env.ACCESS_TOKEN_SECRET || "access_secret_123", // fallback for dev
          { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
          { userId: foundUser._id, email: foundUser.email },
          process.env.REFRESH_TOKEN_SECRET || "refresh_secret_123", // fallback for dev
          { expiresIn: "7d" }
        );

        res.json({
          message: "Login successful",
          accessToken,
          refreshToken,
          user: {
            id: foundUser._id,
            name: foundUser.name,
            email: foundUser.email,
            roles: foundUser.roles && Array.isArray(foundUser.roles) ? foundUser.roles : [foundUser.role || 'Author'], // Robust fallback
            department: foundUser.department,
            photoUrl: foundUser.photoUrl,
            assignedJournals: foundUser.assignedJournals,
            editorJournals: foundUser.editorJournals,
            reviewerJournals: foundUser.reviewerJournals,
            favorites: foundUser.favorites || []
          }
        });
      } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: "Failed to login" });
      }
    });


    // --- NEW ENDPOINTS FOR ROLE-BASED FEATURES ---
    
    // (Consolidated into main notification system above)



    // 1. USER MANAGEMENT (Admin/Editor)
    app.get("/users", async (req, res) => {
      try {
        const allUsers = await user.find({}).sort({ createdAt: -1 }).toArray();
        // Sanitize passwords
        const safeUsers = allUsers.map(u => {
          const { password, verificationCode, ...rest } = u;
          return {
            ...rest,
            id: u._id, // Ensure ID is accessible as 'id'
            roles: Array.isArray(u.roles) ? u.roles : [u.role || 'Author'] // Normalize roles
          };
        });
        res.json(safeUsers);
      } catch (error) {
        console.error("Fetch Users Error:", error);
        res.status(500).json({ error: "Failed to fetch users" });
      }
    });
    // @ -----
    app.get("/users/:id", async (req, res) => {
      try {
        const userId = req.params.id;
        const foundUser = await user.findOne({ _id: new ObjectId(userId) });
        if (!foundUser) {
          return res.status(404).json({ message: "User not found" });
        }

        // Helper to populate journals
        const populateJournals = async (journalIds) => {
          if (!journalIds || !Array.isArray(journalIds) || journalIds.length === 0) return [];
          try {
            // Convert strings to ObjectIds if they are valid 24-char hex strings
            // Convert strings or objects to ObjectIds
            const objectIds = journalIds
              .map(id => {
                if (typeof id === 'string' && id.length === 24) return new ObjectId(id);
                if (typeof id === 'object' && id !== null) {
                  // Handle { id: "..." } or { _id: "..." }
                  const strId = id.id || id._id;
                  if (strId && typeof strId === 'string' && strId.length === 24) return new ObjectId(strId);
                  if (strId instanceof ObjectId) return strId;
                }
                return null;
              })
              .filter(id => id instanceof ObjectId);

            if (objectIds.length === 0) return [];

            const journalDocs = await journals.find({ _id: { $in: objectIds } }).project({ name: 1, department: 1 }).toArray();

            // Add paper counts
            const journalsWithCounts = await Promise.all(journalDocs.map(async (j) => {
              const count = await papers.countDocuments({ journalId: j._id.toString() });
              return { ...j, paperCount: count };
            }));

            return journalsWithCounts;
          } catch (e) {
            console.error("Error populating journals", e);
            return [];
          }
        };

        const safeUser = { ...foundUser };
        delete safeUser.password;
        delete safeUser.verificationCode;

        // Normalize roles
        safeUser.roles = Array.isArray(foundUser.roles) && foundUser.roles.length > 0
          ? foundUser.roles
          : [foundUser.role || 'Author'];

        // Populate Journals
        if (safeUser.editorJournals) {
          safeUser.editorJournals = await populateJournals(safeUser.editorJournals);
        }
        if (safeUser.reviewerJournals) {
          safeUser.reviewerJournals = await populateJournals(safeUser.reviewerJournals);
        }
        if (safeUser.assignedJournals) {
          safeUser.assignedJournals = await populateJournals(safeUser.assignedJournals);
        }

        // Ensure roles is present
        const roles = Array.isArray(foundUser.roles) ? foundUser.roles : [foundUser.role || 'Guest'];
        res.json({ ...safeUser, roles, id: safeUser._id });
      } catch (error) {
        console.error("Fetch User Error:", error);
        res.status(500).json({ error: "Failed to fetch user" });
      }
    });

    app.get("/users", async (req, res) => {
      try {
        const allUsers = await user.find({}, { projection: { password: 0, verificationCode: 0 } }).toArray();

        // Helper to populate journals
        const populateJournals = async (journalIds) => {
          if (!journalIds || !Array.isArray(journalIds) || journalIds.length === 0) return [];
          try {
            const objectIds = journalIds
              .map(id => {
                if (typeof id === 'string' && id.length === 24) return new ObjectId(id);
                if (typeof id === 'object' && id !== null) {
                  const strId = id.id || id._id;
                  if (strId && typeof strId === 'string' && strId.length === 24) return new ObjectId(strId);
                  if (strId instanceof ObjectId) return strId;
                }
                return null;
              })
              .filter(id => id instanceof ObjectId);

            if (objectIds.length === 0) return [];

            const journalDocs = await journals.find({ _id: { $in: objectIds } }).project({ name: 1, department: 1 }).toArray();
             return journalDocs;
          } catch (e) {
            return [];
          }
        };

        // transform single role to roles array for frontend and populate
        const transformedUsers = await Promise.all(allUsers.map(async (u) => {
           const safeUser = {
              ...u,
              roles: Array.isArray(u.roles) ? u.roles : [u.role || 'Guest']
           };
           
           if (safeUser.editorJournals) safeUser.editorJournals = await populateJournals(safeUser.editorJournals);
           if (safeUser.reviewerJournals) safeUser.reviewerJournals = await populateJournals(safeUser.reviewerJournals);
           if (safeUser.assignedJournals) safeUser.assignedJournals = await populateJournals(safeUser.assignedJournals);
           
           return safeUser;
        }));

        res.json(transformedUsers);
      } catch (error) {
        console.error("Fetch All Users Error", error);
        res.status(500).json({ error: "Failed to fetch users" });
      }
    });

    app.put("/users/:id/roles", async (req, res) => {
      try {
        const { roles } = req.body; // Expecting array of strings
        if (!Array.isArray(roles)) return res.status(400).json({ message: "Roles must be an array" });

        const userIdObj = new ObjectId(req.params.id);
        const result = await user.updateOne(
          { _id: userIdObj },
          { $set: { roles } }
        );

        // Notify the user about their role update
        const updatedUser = await user.findOne({ _id: userIdObj });
        if (updatedUser) {
           await createAndSendNotification(
              req.params.id,
              updatedUser.email,
              updatedUser.name,
              "Account Roles Updated",
              `Your account roles have been updated by an administrator. Your current roles are now: ${roles.join(', ')}. Please log out and back in if you do not see these changes in your dashboard.`,
              "info"
           );
        }

        res.json({ message: "User roles updated", result });
      } catch (error) {
        res.status(500).json({ error: "Failed to update roles" });
      }
    });

    // Toggle Favorite Paper
    app.put("/users/:id/favorites", async (req, res) => {
      try {
        const userId = req.params.id;
        const { paperId } = req.body;
        
        const userDoc = await user.findOne({ _id: new ObjectId(userId) });
        if (!userDoc) return res.status(404).json({ error: "User not found" });

        const favorites = userDoc.favorites || [];
        const exists = favorites.includes(paperId);
        
        if (exists) {
            await user.updateOne({ _id: new ObjectId(userId) }, { $pull: { favorites: paperId } });
            res.json({ message: "Removed from favorites", isFavorite: false });
        } else {
            await user.updateOne({ _id: new ObjectId(userId) }, { $addToSet: { favorites: paperId } });
            res.json({ message: "Added to favorites", isFavorite: true });
        }
      } catch (error) {
        console.error("Favorite Toggle Error:", error);
        res.status(500).json({ error: "Failed to update favorites" });
      }
    });

    // Update User Assigned Journals (Admin)
    app.put("/users/:id/journals", async (req, res) => {
      try {
        const { assignedJournals, editorJournals, reviewerJournals } = req.body;

        const updateFields = {};
        if (assignedJournals !== undefined) updateFields.assignedJournals = assignedJournals; // Keep for backward compat or general
        if (editorJournals !== undefined) updateFields.editorJournals = editorJournals;
        if (reviewerJournals !== undefined) updateFields.reviewerJournals = reviewerJournals;

        const result = await user.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: updateFields }
        );
        res.json({ message: "User journals updated", result });
      } catch (error) {
        console.error("Update Journals Error:", error);
        res.status(500).json({ error: "Failed to update assigned journals" });
      }
    });

    // Update User Profile (Photo + Data)
    app.put("/users/:id", upload.single('photo'), async (req, res) => {
      try {
        console.log("PUT /users/:id hit", req.params.id);
        console.log("Body:", req.body);
        console.log("File:", req.file);

        const { name, bio, phone, department, institution } = req.body;
        const userId = req.params.id;

        let updateData = {
          name,
          bio,
          phone,
          department,
          institution
        };

        if (req.file) {
          updateData.photoUrl = `/uploads/${req.file.filename}`;
        }

        // Remove undefined fields - explictly check for undefined strings "undefined" too just in case
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === undefined || updateData[key] === 'undefined') {
            delete updateData[key];
          }
        });

        console.log("Update Data:", updateData);

        const result = await user.updateOne(
          { _id: new ObjectId(userId) },
          { $set: updateData }
        );

        console.log("Update Result:", result);

        // Fetch updated user to return (optional but good for context update)
        const updatedUser = await user.findOne({ _id: new ObjectId(userId) });

        res.json({
          message: "Profile updated successfully",
          user: {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            photoUrl: updatedUser.photoUrl,
            bio: updatedUser.bio,
            phone: updatedUser.phone,
            department: updatedUser.department,
            institution: updatedUser.institution
          }
        });

      } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ error: "Failed to update profile" });
      }
    });

    // Delete User Endpont
    app.delete("/users/:id", async (req, res) => {
      try {
        const userId = req.params.id;
        const result = await user.deleteOne({ _id: new ObjectId(userId) });
        if (result.deletedCount === 1) {
          res.json({ message: "User deleted successfully" });
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ error: "Failed to delete user" });
      }
    });

    // 2. PAPER MANAGEMENT

    // Helper to generate Manuscript ID (e.g., JRP-2026-001)
    const generateManuscriptId = async () => {
      const count = await papers.countDocuments();
      const year = new Date().getFullYear();
      const pad = (n) => (n < 1000 ? ("00" + n).slice(-3) : n);
      return `JRP-${year}-${pad(count + 1)}`;
    };

    app.post("/papers", upload.fields([{ name: 'manuscript', maxCount: 10 }, { name: 'coverLetter', maxCount: 1 }]), async (req, res) => {
      try {
        console.log("Paper submission body:", req.body);
        console.log("Paper submission files:", req.files);

        const { title, abstract, authorId, authorName, department, type, keywords, coAuthors, journalId, journalName } = req.body;

        // Parse JSON strings if necessary (FormData sends arrays as strings)
        let parsedKeywords = [];
        let parsedCoAuthors = [];
        try {
          parsedKeywords = Array.isArray(keywords) ? keywords : JSON.parse(keywords || '[]');
          parsedCoAuthors = Array.isArray(coAuthors) ? coAuthors : JSON.parse(coAuthors || '[]');
        } catch (e) {
          console.error("Error parsing arrays:", e);
        }

        const manuscriptFiles = req.files['manuscript'] || [];
        const coverLetterFile = req.files['coverLetter'] ? req.files['coverLetter'][0] : null;

        console.log("Processing Submission");
        console.log("- Author ID:", authorId);
        console.log("- Author Name:", authorName);
        console.log("- Manuscript Files:", manuscriptFiles.length);

        if (manuscriptFiles.length === 0) {
          console.error("Missing Manuscript File");
          return res.status(400).json({ error: "At least one manuscript file is required" });
        }

        // --- ENHANCED CO-AUTHOR LOGIC ---
        const enrichedCoAuthors = await Promise.all(parsedCoAuthors.map(async (author) => {
           // 1. Check if user exists by email
           const existingUser = await user.findOne({ email: author.email });
           
           if (existingUser) {
              return {
                 ...author,
                 userId: existingUser._id, // Link to actual user ID
                 isRegistered: true,
                 photoUrl: existingUser.photoUrl
              };
           } else {
              // 2. Unregistered - Send Invitation Email
              // Only send if not just created/duplicate in this batch (simplified)
              const mailOptions = {
                 from: process.env.EMAIL_USER,
                 to: author.email,
                 subject: "Co-Author Invitation - Research Portal",
                 text: `Hello ${author.name},\n\nYou have been listed as a co-author on a paper titled "${title}" submitted by ${authorName}.\n\nPlease register at our portal to view and manage this submission:\nhttp://localhost:5173/register\n\nBest regards,\nEditorial Team`
              };
              
              console.log(`[DEBUG] Preparing invitation for ${author.email}`);
              try {
                  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                      console.log(`[DEBUG] Sending email via Transporter to ${author.email}...`);
                      await transporter.sendMail(mailOptions);
                      console.log(`[SUCCESS] Invitation sent to ${author.email}`);
                  } else {
                      console.warn(`[WARN] Email credentials missing. Invitation NOT sent. Check EMAIL_USER/EMAIL_PASS.`);
                      console.log(`[DEV MODE] Invitation Sim for ${author.email}:`, mailOptions.text);
                  }
              } catch (e) {
                  console.error(`[ERROR] Failed to send invitation email to ${author.email}:`, e.message);
                  if (e.response) console.error("SMTP Response:", e.response);
              }

              return {
                 ...author,
                 userId: null,
                 isRegistered: false
              };
           }
        }));

        const manuscriptId = await generateManuscriptId();

        // Map all manuscript files
        const fileObjects = manuscriptFiles.map(f => ({
            url: `/uploads/${f.filename}`,
            originalName: f.originalname,
            mimeType: f.mimetype
        }));

        const newPaper = {
          manuscriptId, // Display ID
          title,
          abstract,
          authorId,
          authorName,
          department,
          journalId, // Link to Journal
          journalName,
          type: type || "Research Article",
          keywords: parsedKeywords,
          coAuthors: enrichedCoAuthors, // Use executed promise result

          // Files
          fileUrl: fileObjects[0].url, // Primary file (first one)
          originalFileName: fileObjects[0].originalName, // Primary file name
          files: fileObjects, // Store all files
          coverLetterUrl: coverLetterFile ? `/uploads/${coverLetterFile.filename}` : null,
          coverLetterOriginalName: coverLetterFile ? coverLetterFile.originalname : null,

          // Status & Versioning
          version: 1, // Start at v1
          status: "Submitted", // Submitted -> Under Review -> Revision -> Accepted/Rejected
          previousVersions: [], // Store history here

          // Timeline
          submittedDate: new Date(),
          lastUpdatedDate: new Date(),

          // Review Process
          editorId: null, // Associate Editor
          reviewers: [], // Array of reviewer objects
          reviewRounds: [], // History of review cycles

          // Decision
          decision: null, // Final decision
          classification: "Unclassified" // For confidental notes
        };

        const result = await papers.insertOne(newPaper);

        // Fetch user email to send email
        const authorUser = await user.findOne({ _id: new ObjectId(authorId) });

        if (authorUser) {
           await createAndSendNotification(
             authorId,
             authorUser.email,
             authorName,
             "Submission Received",
             `Your paper titled "${title}" has been successfully submitted and is pending editorial review. Manuscript ID: ${manuscriptId}`,
             "info",
             result.insertedId
           );
        }

        await notifyAllEditors(
          `A new paper titled "${title}" has been submitted by ${authorName}.`,
          "info",
          result.insertedId,
          "New Paper Submission"
        );

        res.status(201).json({
          message: "Paper submitted successfully",
          paperId: result.insertedId,
          manuscriptId: manuscriptId
        });
      } catch (error) {
        console.error("Submit Paper Error:", error);
        // Write to log file
        try {
          const fs = require('fs');
          const path = require('path');
          fs.appendFileSync(path.join(__dirname, 'error.log'), `${new Date().toISOString()} - Submit Error: ${error.stack}\n`);
        } catch (e) {
          console.error("Failed to write log", e);
        }
        res.status(500).json({ error: "Failed to submit paper: " + error.message });
      }
    });

    app.get("/papers", async (req, res) => {
      try {
        const { authorId, status, reviewerId, journalId, editorId } = req.query;
        let query = {};
        if (authorId) query.authorId = authorId;
        if (status) query.status = status;

        // Journal ID Filter (supports comma-separated list)
        if (journalId) {
          const journalIds = journalId.split(',');
          if (journalIds.length > 1) {
            query.journalId = { $in: journalIds };
          } else {
            query.journalId = journalId;
          }
        }

        // Editor ID Filter
        if (editorId) query.editorId = editorId;

        console.log("Fetching papers with query:", query);
        console.log("Fetching papers with query:", query);
        const allPapers = await papers.find(query).sort({ submittedDate: -1 }).toArray();
        res.json(allPapers);
      } catch (error) {
        console.error("Fetch Papers Error", error);
        res.status(500).json({ error: "Failed to fetch papers" });
      }
    });

    // Get Single Paper Details
    app.get("/papers/:id", async (req, res) => {
      try {
        const paperId = req.params.id;
        // Validate ID format (24 chars hex)
        if (!ObjectId.isValid(paperId)) {
           return res.status(400).json({ error: "Invalid paper ID format" });
        }
        
        const paper = await papers.findOne({ _id: new ObjectId(paperId) });
        
        if (!paper) {
          return res.status(404).json({ error: "Paper not found" });
        }
        
        res.json(paper);
      } catch (error) {
        console.error("Fetch Paper Details Error:", error);
        res.status(500).json({ error: "Failed to fetch paper details" });
      }
    });


    
    // Submit Revision (Duplicate removed)


    app.put("/papers/:id", async (req, res) => {
      try {
        const { status, decision, feedback } = req.body;
        let updateData = {};
        if (status) updateData.status = status;
        if (decision) updateData.decision = decision; // For final verdict
        if (feedback) updateData.feedback = feedback;

        await papers.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: updateData }
        );
        res.json({ message: "Paper updated" });
      } catch (error) {
        res.status(500).json({ error: "Failed to update paper" });
      }
    });

    // 3. EDITORIAL MANAGEMENT (Assign Editor, Desk Reject)

    // Assign Associate Editor (by EIC)
    app.put("/papers/:id/assign-editor", async (req, res) => {
      try {
        const { editorId, editorName, paperTitle } = req.body;
        await papers.updateOne(
          { _id: new ObjectId(req.params.id) },
          {
            $set: {
              editorId: editorId,
              editorName: editorName,
              status: "Under Review", // Technically "With Editor"
              lastUpdatedDate: new Date()
            }
          }
        );
        
        // Notify AE
        const assignedEditor = await user.findOne({ _id: new ObjectId(editorId) });
        if (assignedEditor) {
            await createAndSendNotification(
              editorId,
              assignedEditor.email,
              assignedEditor.name,
              "New Editorial Assignment",
              `You have been assigned as the Associate Editor for the paper "${paperTitle || 'Unknown Title'}". Please review the submission in your queue.`,
              "info",
              req.params.id
            );
        }
        res.json({ message: "Associate Editor assigned successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to assign editor" });
      }
    });

    // Desk Reject (by AE or EIC)
    app.put("/papers/:id/desk-reject", async (req, res) => {
      try {
        const { reason } = req.body;
        await papers.updateOne(
          { _id: new ObjectId(req.params.id) },
          {
            $set: {
              status: "Desk Rejected",
              decision: "Desk Reject",
              decisionDate: new Date(),
              decisionReason: reason,
              lastUpdatedDate: new Date()
            }
          }
        );

        // NOTIFY AUTHORS
        await notifyPaperAuthors(
           req.params.id, 
           "Paper Desk Rejected", 
           "Your paper has been desk rejected. Please check feedback.", 
           "error"
        );

        res.json({ message: "Paper has been desk rejected" });
      } catch (error) {
        res.status(500).json({ error: "Failed to desk reject paper" });
      }
    });

    // 4. REVIEW MANAGEMENT

    // Get Reviews
    app.get("/reviews", async (req, res) => {
      try {
        const { reviewerId } = req.query;
        let query = {};
        if (reviewerId) query.reviewerId = reviewerId;
        const result = await reviews.find(query).sort({ assignedDate: -1 }).toArray();
        res.json(result);
      } catch (error) {
        console.error("Fetch Reviews Error:", error);
        res.status(500).json({ error: "Failed to fetch reviews" });
      }
    });

    // Invite Reviewer (Step 3)
    app.post("/reviews/invite", async (req, res) => {
      try {
        const { paperId, reviewerId, reviewerName, dueDate } = req.body;

        // 1. Create Review Record
        const newReview = {
          paperId: new ObjectId(paperId),
          reviewerId,
          reviewerName,
          status: "invited", // invited, accepted, declined, completed
          assignedDate: new Date(),
          dueDate: new Date(dueDate),

          // Scores placeholders
          scores: {
            originality: 0,
            methodology: 0,
            technical: 0,
            clarity: 0,
            references: 0
          },
          recommendation: null,
          confidentialComments: "",
          commentsToAuthor: ""
        };
        const result = await reviews.insertOne(newReview);
        const reviewId = result.insertedId;

        // 2. Update Paper's reviewer list
        await papers.updateOne(
          { _id: new ObjectId(paperId) },
          {
            $push: {
              reviewers: {
                id: reviewerId,
                name: reviewerName,
                status: "invited",
                reviewId: reviewId
              }
            },
            $set: {
              status: "Under Review", // Ensure status reflects active review
              lastUpdatedDate: new Date()
            }
          }
        );

        // 3. Notify the Reviewer
        const paper = await papers.findOne({ _id: new ObjectId(paperId) });
        const reviewerUser = await user.findOne({ _id: new ObjectId(reviewerId) });
        if (reviewerUser && paper) {
            await createAndSendNotification(
              reviewerId,
              reviewerUser.email,
              reviewerUser.name,
              "Review Request",
              `You have been invited to review the paper titled "${paper.title}". Please log in to your dashboard to accept or decline this request. Due date: ${new Date(dueDate).toLocaleDateString()}`,
              "info",
              reviewId
            );
        }

        res.status(201).json({ message: "Reviewer invited successfully", reviewId });
      } catch (error) {
        console.error("Invite Reviewer Error:", error);
        res.status(500).json({ error: "Failed to invite reviewer" });
      }
    });

    // Re-assign Reviewers (For Revision Loop)
    app.post("/papers/:id/reassign-reviewers", async (req, res) => {
      try {
        const paperId = req.params.id;
        const paper = await papers.findOne({ _id: new ObjectId(paperId) });
        
        if (!paper) return res.status(404).json({ error: "Paper not found" });

        // Get unique list of PREVIOUS reviewers (from the paper.reviewers array)
        // We probably only want to re-assign those who were involved?
        // Let's re-invite ALL unique reviewers currently listed.
        const currentReviewers = paper.reviewers || [];
        const uniqueReviewerIds = [...new Set(currentReviewers.map(r => r.id || r.reviewerId))];
        
        if (uniqueReviewerIds.length === 0) {
           return res.status(400).json({ error: "No previous reviewers to re-assign" });
        }

        const newReviewerEntries = [];

        // For each unique reviewer, create a NEW review request
        for (const reviewerId of uniqueReviewerIds) {
           // Find reviewer name from previous entry or fetch user? 
           // Optimization: use name from previous entry
           const prevEntry = currentReviewers.find(r => (r.id || r.reviewerId) === reviewerId);
           const reviewerName = prevEntry ? prevEntry.name : "Reviewer";

           const newReview = {
             paperId: new ObjectId(paperId),
             reviewerId: reviewerId,
             reviewerName: reviewerName,
             status: "invited",
             assignedDate: new Date(),
             dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
             scores: { originality: 0, methodology: 0, technical: 0, clarity: 0, references: 0 },
             recommendation: null,
             confidentialComments: "",
             commentsToAuthor: ""
           };
           
           const result = await reviews.insertOne(newReview);
           newReviewerEntries.push({
              id: reviewerId,
              name: reviewerName,
              status: "invited",
              reviewId: result.insertedId
           });
        }

        // Update Paper: Append new reviewers (creating history) OR Reset?
        // Appending ensures history.
        // Also update status to 'Under Review'.
        await papers.updateOne(
          { _id: new ObjectId(paperId) },
          {
            $push: { reviewers: { $each: newReviewerEntries } },
            $set: { 
               status: "Under Review",
               lastUpdatedDate: new Date()
            }
          }
        );

        res.json({ message: `Re-assigned ${newReviewerEntries.length} reviewers` });

      } catch (error) {
        console.error("Reassign Reviewers Error:", error);
        res.status(500).json({ error: "Failed to re-assign reviewers" });
      }
    });

    // Remove Reviewer
    app.delete("/papers/:paperId/reviewers/:reviewerId", async (req, res) => {
      try {
        const { paperId, reviewerId } = req.params;

        // 1. Remove from Papers collection
        await papers.updateOne(
          { _id: new ObjectId(paperId) },
          { $pull: { reviewers: { id: reviewerId } } }
        );

        // 2. Remove from Reviews collection
        await reviews.deleteOne({
          paperId: new ObjectId(paperId),
          reviewerId: reviewerId
        });

        res.json({ message: "Reviewer removed successfully" });
      } catch (error) {
        console.error("Remove Reviewer Error:", error);
        res.status(500).json({ error: "Failed to remove reviewer" });
      }
    });

    // Reviewer Response (Step 4: Accept/Decline)
    app.put("/reviews/:id/respond", async (req, res) => {
      try {
        const { action, reason } = req.body; // action: 'accept' | 'decline'
        const reviewId = req.params.id;

        const status = (action && action.toLowerCase() === 'accepted') || (action && action.toLowerCase() === 'accept') ? 'accepted' : 'declined';

        await reviews.updateOne(
          { _id: new ObjectId(req.params.id) },
          {
            $set: {
              status,
              responseDate: new Date(),
              declineReason: reason || null
            }
          }
        );

        // Update paper status for this reviewer
        // We need paperId from the review
        const review = await reviews.findOne({ _id: new ObjectId(req.params.id) });
        if (review) {
          await papers.updateOne(
            { _id: review.paperId, "reviewers.reviewId": review._id },
            { $set: { "reviewers.$.status": status } }
          );

          // Notify Editor if Accepted
          if (status === 'accepted') {
             const paper = await papers.findOne({ _id: review.paperId });
             if (paper && paper.editorId) {
                const editorUser = await user.findOne({ _id: new ObjectId(paper.editorId) });
                if (editorUser) {
                   await createAndSendNotification(
                      paper.editorId,
                      editorUser.email,
                      editorUser.name,
                      "Review Invitation Accepted",
                      `Reviewer ${review.reviewerName} has ACCEPTED the invitation for paper: ${paper.title}`,
                      "success",
                      paper._id
                   );
                }
             }
          }
        }

        res.json({ message: `Review invitation ${status}` });
      } catch (error) {
        res.status(500).json({ error: "Failed to respond to invitation" });
      }
    });

    // Submit Peer Review (Step 5)
    app.put("/reviews/:id", async (req, res) => {
      try {
        const { scores, recommendation, commentsToAuthor, confidentialComments } = req.body;
        const reviewId = req.params.id;

        // 1. Update Review
        await reviews.updateOne(
          { _id: new ObjectId(reviewId) },
          {
            $set: {
              scores, // { originality, methodology, ... }
              recommendation, // Accept, Minor, Major, Reject
              commentsToAuthor,
              confidentialComments,
              status: "completed",
              completedDate: new Date()
            }
          }
        );

        // 2. Update Paper's reviewer status
        const review = await reviews.findOne({ _id: new ObjectId(reviewId) });
        if (review) {
          await papers.updateOne(
            { _id: review.paperId, "reviewers.reviewId": review._id },
            { $set: { "reviewers.$.status": "completed" } }
          );

          // Check if all reviewers completed? Not strictly necessary for MVP, 
          // but good to know for UI. 

          // 3. Notify Editor
           const paper = await papers.findOne({ _id: review.paperId });
           if (paper && paper.editorId) {
             const editorUser = await user.findOne({ _id: new ObjectId(paper.editorId) });
             if (editorUser) {
                await createAndSendNotification(
                   paper.editorId,
                   editorUser.email,
                   editorUser.name,
                   "Review Submitted",
                   `A review has been submitted for paper: ${paper.title}. Reviewer: ${review.reviewerName}`,
                   "success",
                   paper._id
                );
             }
           }
        }

        res.json({ message: "Review submitted" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to submit review" });
      }
    });

    // 5. DECISION & REVISION (Steps 6, 7, 8, 9)

    // --- NOTIFICATION HELPERS (Consolidated) ---
    // createNotification is defined at the top scope

    const notifyPaperAuthors = async (paperId, title, message, type = 'info') => {
       try {
          const paper = await papers.findOne({ _id: new ObjectId(paperId) });
          if (!paper) return;

          // 1. Notify Main Author
          const mainAuthorUser = await user.findOne({ _id: new ObjectId(paper.authorId) });
          if (mainAuthorUser) {
             await createAndSendNotification(
                paper.authorId,
                mainAuthorUser.email,
                mainAuthorUser.name,
                title,
                message,
                type,
                paper._id
             );
          }

          // 2. Notify Registered Co-Authors
          if (paper.coAuthors && Array.isArray(paper.coAuthors)) {
             for (const coAuthor of paper.coAuthors) {
                if (coAuthor.isRegistered && coAuthor.userId) {
                   // Avoid duplicate if main author is listed in coAuthors (unlikely but safe)
                   if (coAuthor.userId.toString() !== paper.authorId.toString()) {
                      const coAuthorUser = await user.findOne({ _id: new ObjectId(coAuthor.userId) });
                      if (coAuthorUser) {
                          await createAndSendNotification(
                             coAuthor.userId,
                             coAuthorUser.email,
                             coAuthorUser.name,
                             title,
                             message,
                             type,
                             paper._id
                          );
                      }
                   }
                }
             }
          }
       } catch (e) {
          console.error("Notify Authors Error:", e);
       }
    };

    // Make Decision (AE or EIC)
    app.post("/papers/:id/decision", async (req, res) => {
      try {
        let { decision, reason, comments } = req.body;
        decision = decision ? decision.trim() : decision;
        // Decision: 'Accept', 'Minor Revision', 'Major Revision', 'Reject'

        let newStatus = "Decision Made";
        if (decision === 'Accept') newStatus = 'Accepted';
        if (decision === 'Reject' || decision === 'Desk Reject') newStatus = 'Rejected'; 
        if (decision === 'Desk Reject') newStatus = 'Desk Rejected';
        if (decision.includes('Revision')) newStatus = 'Revision Required';
        if (decision === 'Request Final Submission') newStatus = 'final_submission_requested';
        if (decision === 'Send to Publisher') newStatus = 'ready_for_publication';

        await papers.updateOne(
          { _id: new ObjectId(req.params.id) },
          {
            $set: {
              decision,
              decisionReason: reason || null,
              decisionComments: comments || null,
              status: newStatus,
              decisionDate: new Date(),
              lastUpdatedDate: new Date()
            }
          }
        );

        // NOTIFY AUTHORS
        const notifTitle = `Decision: ${decision}`;
        const notifMessage = `A decision has been made on your paper: ${decision}. Please check your dashboard for details.`;
        // Use 'success' for accept, 'error' for reject, 'warning' for revision
        let notifType = 'info';
        if (newStatus === 'Accepted') notifType = 'success';
        if (newStatus === 'Rejected' || newStatus === 'Desk Rejected') notifType = 'error';
        if (newStatus === 'Rejected' || newStatus === 'Desk Rejected') notifType = 'error';
        if (newStatus === 'Revision Required') notifType = 'warning';
        if (newStatus === 'final_submission_requested') {
           notifType = 'success';
           notifMessage = "Your paper has been provisionally accepted. Please submit the final camera-ready version.";
        }
        if (newStatus === 'ready_for_publication') {
           notifType = 'success';
           notifMessage = "Your paper has been sent to the publisher for final publication.";
        }

        await notifyPaperAuthors(req.params.id, notifTitle, notifMessage, notifType);

        res.json({ message: "Decision recorded successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to record decision" });
      }
    });

    // Submit Revision (Author)
    app.post("/papers/:id/revision", upload.fields([{ name: 'manuscript', maxCount: 1 }, { name: 'responseToReviewers', maxCount: 1 }]), async (req, res) => {
      try {
        const paperId = req.params.id;
        const manuscriptFile = req.files['manuscript'] ? req.files['manuscript'][0] : null;
        const responseFile = req.files['responseToReviewers'] ? req.files['responseToReviewers'][0] : null;

        if (!manuscriptFile) {
          return res.status(400).json({ error: "Revised manuscript file is required" });
        }

        // Get current paper to check version
        const currentPaper = await papers.findOne({ _id: new ObjectId(paperId) });
        const newVersion = (currentPaper.version || 1) + 1;

        // Archive current version to previousVersions
        const archivedVersion = {
          version: currentPaper.version || 1,
          fileUrl: currentPaper.fileUrl,
          submittedDate: currentPaper.submittedDate, // or lastUpdated from that version
          decision: currentPaper.decision,
          decisionReason: currentPaper.decisionReason,
          decisionComments: currentPaper.decisionComments
        };

        // Check if this was a Final Submission
        // status check OR decision string check (permissive)
        const isFinalSubmission = 
           currentPaper.status === 'final_submission_requested' || 
           currentPaper.status === 'Accepted' || 
           (currentPaper.decision && (currentPaper.decision.includes('Final') || currentPaper.decision === 'Accept'));
           
        const newStatus = isFinalSubmission ? 'final_submitted' : 'Revision Submitted';
        const newDecision = isFinalSubmission ? 'final_submitted' : null;

        await papers.updateOne(
          { _id: new ObjectId(paperId) },
          {
            $push: { previousVersions: archivedVersion },
            $set: {
              version: newVersion,
              fileUrl: `/uploads/${manuscriptFile.filename}`,
              originalFileName: manuscriptFile.originalname,
              responseToReviewersUrl: responseFile ? `/uploads/${responseFile.filename}` : null,
              status: newStatus, 
              decision: newDecision, // Set explicitly for filtering
              decisionReason: null, // Clear decision reason
              submittedDate: new Date(), 
              lastUpdatedDate: new Date()
            }
          }
        );

        // Reset reviewers status? 
        // Often we re-invite same reviewers. 
        // For now, let editor manage that manually. 

        res.json({ message: "Revision submitted successfully", version: newVersion });
      } catch (error) {
        console.error("Revision Error:", error);
        res.status(500).json({ error: "Failed to submit revision" });
      }
    });
    // Reassign Reviewers (Editor)
    app.post("/papers/:id/reassign-reviewers", async (req, res) => {
       try {
          const paperId = req.params.id;
          const paper = await papers.findOne({ _id: new ObjectId(paperId) });
          if (!paper) return res.status(404).json({ error: "Paper not found" });

          // Logic: Find reviewers who were assigned before (or specifically those who asked for revision)
          // For simplicity/MVP: Re-invite ALL currently listed reviewers in the array
          // In a real system, might filter by those who didn't Reject.
          
          const reviewersToReassign = paper.reviewers || [];
          if (reviewersToReassign.length === 0) {
             return res.status(400).json({ error: "No reviewers to reassign. Please assign manually." });
          }

          let reassignCount = 0;
          for (const reviewer of reviewersToReassign) {
             // Create NEW review entry for this new version
             const newReview = {
                paperId: new ObjectId(paperId),
                reviewerId: reviewer.reviewerId, // stored as ObjectId usually? or string in array? check schema. usually matches reviews collection
                reviewerName: reviewer.name,
                assignedDate: new Date(),
                status: 'pending',
                version: paper.version
             };
             
             // Insert into reviews collection
             await reviews.insertOne(newReview);

             // Update reviewer status in paper array to 'pending'
             await papers.updateOne(
                { _id: new ObjectId(paperId), "reviewers.reviewerId": reviewer.reviewerId },
                { $set: { "reviewers.$.status": 'pending' } }
             );

             // Notify Reviewer
             const reviewerUser = await user.findOne({ _id: new ObjectId(reviewer.reviewerId) });
             if (reviewerUser) {
                 await createAndSendNotification(
                    reviewer.reviewerId,
                    reviewerUser.email,
                    reviewerUser.name,
                    "Review Re-assignment",
                    `You have been re-assigned to review a revised version of: ${paper.title}`,
                    "info",
                    paper._id
                 );
             }
             reassignCount++;
          }

          // Update Paper Status back to Under Review
          await papers.updateOne(
             { _id: new ObjectId(paperId) },
             { $set: { status: 'Under Review', decision: null } }
          );

          res.json({ message: `Re-assigned ${reassignCount} reviewers`, count: reassignCount });
       } catch (error) {
          console.error("Reassign Error:", error);
          res.status(500).json({ error: "Failed to reassign reviewers" });
       }
    });

    app.get("/reviews", async (req, res) => {
      try {
        const { reviewerId, paperId } = req.query;
        let query = {};
        if (reviewerId) query.reviewerId = reviewerId;
        if (paperId) query.paperId = new ObjectId(paperId);

        const userReviews = await reviews.find(query).toArray();
        res.json(userReviews);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch reviews" });
      }
    });

    // --- JOURNAL MANAGEMENT ---

    // Get All Journals
    app.get("/journals", async (req, res) => {
      try {
        const allJournals = await journals.find({}).toArray();
        res.json(allJournals);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch journals" });
      }
    });
    
    // Get Journal Details
    app.get("/journals/:id", async (req, res) => {
      try {
        const journal = await journals.findOne({ _id: new ObjectId(req.params.id) });
        if (!journal) return res.status(404).json({ error: "Journal not found" });
        res.json(journal);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch journal" });
      }
    });

    // Get Journal People (EIC, Editors, Reviewers, Authors)
    app.get("/journals/:id/people", async (req, res) => {
      try {
        const journalId = req.params.id;
        
        // Find Editors & Reviewers associated with this journal 
        // (Note: This depends on how we structure the data. 
        //  Currently users have editorJournals/reviewerJournals arrays of objects {id: '...', name: '...'} or strings)
        
        const allUsers = await user.find({}).toArray();
        const editors = [];
        const reviewers = [];
        const authors = new Set(); // Unique authors

        // Helpers to check association
        const isAssociated = (userList, jId) => {
           if (!userList) return false;
           return userList.some(j => (typeof j === 'string' && j === jId) || (j.id === jId) || (j._id === jId));
        };

        allUsers.forEach(u => {
           if (isAssociated(u.editorJournals, journalId)) editors.push({ id: u._id, name: u.name, photoUrl: u.photoUrl, roles: u.roles });
           if (isAssociated(u.reviewerJournals, journalId)) reviewers.push({ id: u._id, name: u.name, photoUrl: u.photoUrl, roles: u.roles });
        });

        // Find Authors who published in this journal
        const journalPapers = await papers.find({ journalId: journalId, status: { $ne: 'Rejected' } }).toArray();
        journalPapers.forEach(p => {
           if (p.authorId) {
             const authorUser = allUsers.find(u => u._id.toString() === p.authorId);
             if (authorUser) {
                authors.add(JSON.stringify({ id: authorUser._id, name: authorUser.name, photoUrl: authorUser.photoUrl }));
             } else {
                // If author user deleted or not found but name exists on paper
                authors.add(JSON.stringify({ id: p.authorId, name: p.authorName }));
             }
           }
        });

        const authorsList = Array.from(authors).map(a => JSON.parse(a));

        res.json({
           editors,
           reviewers,
           authors: authorsList
        });

      } catch (error) {
        console.error("Journal People Error:", error);
        res.status(500).json({ error: "Failed to fetch journal people" });
      }
    });

    // --- HOMEPAGE AGGREGATION ---
    app.get("/public/home-data", async (req, res) => {
      try {
        const allJournals = await journals.find({}).toArray();
        const allPapers = await papers.find({ status: { $in: ['Published', 'final_submitted', 'Accepted'] } }).toArray();
        const allUsers = await user.find({}).toArray();

        const homeData = allJournals.map(journal => {
           // 1. Filter Papers for this journal
           // Check matching by journalId or department fallback
           const journalPapers = allPapers.filter(p => 
              p.journalId === journal._id.toString() || 
              p.department === journal.department
           );

           // 2. Stats
           // Most Viewed (Mock random if missing)
           const mostViewed = [...journalPapers].sort((a, b) => (b.views || 0) - (a.views || 0))[0] || null;
           // Latest
           const latest = [...journalPapers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;

           // 3. Boards
           // Editors: Users with Role 'Editor' whose dept matches journal OR are in editorJournals list
           const editors = allUsers.filter(u => 
              (u.roles && u.roles.includes('Editor') && u.department === journal.department) ||
              (u.editorJournals && u.editorJournals.some(ej => ej.id === journal._id.toString()))
           ).slice(0, 5).map(u => ({ name: u.name, photoUrl: u.photoUrl }));

           // Reviewers
           const reviewers = allUsers.filter(u => 
              (u.roles && u.roles.includes('Reviewer') && u.department === journal.department) ||
              (u.reviewerJournals && u.reviewerJournals.some(rj => rj.id === journal._id.toString()))
           ).slice(0, 5).map(u => ({ name: u.name, photoUrl: u.photoUrl }));

           // Top Authors (based on count in this journal)
           const authorCounts = {};
           journalPapers.forEach(p => {
               const name = p.authorName || 'Unknown';
               authorCounts[name] = (authorCounts[name] || 0) + 1;
           });
           const topAuthors = Object.entries(authorCounts)
               .sort(([,a], [,b]) => b - a)
               .slice(0, 5)
               .map(([name]) => ({ name }));

           return {
             ...journal,
             stats: {
                mostViewed: mostViewed ? { ...mostViewed, views: mostViewed.views || Math.floor(Math.random() * 500) + 50 } : null,
                latest: latest
             },
             boards: {
                editors,
                reviewers,
                topAuthors
             }
           };
        });

        res.json(homeData);

      } catch (error) {
        console.error("Home Data Error:", error);
        res.status(500).json({ error: "Failed to fetch home data" });
      }
    });

    // Create Journal
    app.post("/journals", async (req, res) => {
      try {
        const { name, faculty, department, eicId, eicName, description } = req.body;

        const newJournal = {
          name,
          faculty,
          department,
          eicId,
          eicName,
          description,
          createdAt: new Date(),
          status: 'Active'
        };

        const result = await journals.insertOne(newJournal);

        // Grant 'Editor' role to the assigned EIC if they don't have it
        if (eicId) {
          const eicUser = await user.findOne({ _id: new ObjectId(eicId) });
          // Check if user exists and doesn't already have 'Editor' role
          if (eicUser && (!eicUser.roles || !eicUser.roles.includes('Editor'))) {
            await user.updateOne(
              { _id: new ObjectId(eicId) },
              { $addToSet: { roles: 'Editor' } } // Only adds if not present
            );
            console.log(`Granted Editor role to ${eicName}`);
          }
        }

        res.status(201).json({ message: "Journal created", journalId: result.insertedId });
      } catch (error) {
        res.status(500).json({ error: "Failed to create journal" });
      }
    });

    // Get All Departments
    app.get("/departments", async (req, res) => {
      try {
        const allDepts = await departments.find({}).sort({ name: 1 }).toArray();
        res.json(allDepts);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch departments" });
      }
    });

    // Get Global Stats (For Hero Section)
    app.get("/stats", async (req, res) => {
      try {
        const papersCount = await papers.countDocuments({ status: { $ne: 'Rejected' } });
        const usersCount = await user.countDocuments({});
        const journalsCount = await journals.countDocuments({});

        res.json({
          papers: papersCount,
          researchers: usersCount,
          journals: journalsCount
        });
      } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ error: "Failed to fetch stats" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Research Portal Server is Running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("Email System Configured:", process.env.EMAIL_USER ? "Yes (" + process.env.EMAIL_USER + ")" : "No");
});
