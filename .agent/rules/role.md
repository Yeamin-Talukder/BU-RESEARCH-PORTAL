---
trigger: always_on
---



{
  "roles": {
    "author": {
      "can": [
        "register",
        "login",
        "submit_manuscript",
        "update_manuscript",
        "withdraw_manuscript",
        "view_own_reviews",
        "view_editor_decisions",
        "view_status_timeline",
        "view_acceptance_letter",
        "update_profile"
      ],
      "cannot": [
        "perform_technical_screening",
        "desk_reject",
        "assign_associate_editor",
        "assign_reviewers",
        "accept_decline_review",
        "submit_peer_review",
        "recommend_decision",
        "make_final_decision",
        "approve_publication",
        "create_journal",
        "create_department",
        "merge_department",
        "update_user_roles",
        "merge_user_accounts",
        "create_volume",
        "publish_paper",
        "override_decision",
        "change_system_config"
      ]
    },
    "reviewer": {
      "can": [
        "register",
        "login",
        "accept_review_request",
        "decline_review_request",
        "submit_peer_review",
        "verify_revision",
        "update_own_review_status",
        "view_assigned_manuscripts",
        "view_revised_manuscripts",
        "view_author_responses"
      ],
      "cannot": [
        "view_author_identity",
        "view_other_reviewers",
        "view_editorial_notes",
        "make_editorial_decision",
        "assign_reviewers",
        "desk_reject",
        "create_journal",
        "update_user_roles",
        "merge_user_accounts",
        "publish_paper",
        "override_decision",
        "change_system_config"
      ]
    },
    "associate_editor": {
      "can": [
        "register",
        "login",
        "perform_technical_screening",
        "desk_reject",
        "assign_reviewers",
        "recommend_decision",
        "request_revision",
        "read_all_reviews",
        "resolve_review_conflicts",
        "add_editorial_notes",
        "validate_revision_compliance",
        "update_manuscript_status",
        "set_reviewer_deadlines",
        "manage_review_cycles"
      ],
      "cannot": [
        "make_final_decision",
        "approve_publication",
        "create_journal",
        "create_department",
        "update_user_roles",
        "merge_user_accounts",
        "publish_paper",
        "override_decision",
        "change_system_config"
      ]
    },
    "editor_in_chief": {
      "can": [
        "register",
        "login",
        "perform_technical_screening",
        "desk_reject",
        "assign_associate_editor",
        "assign_reviewers",
        "make_final_decision",
        "approve_for_publication",
        "evaluate_reviews",
        "review_associate_editor_recommendations",
        "final_acceptance",
        "lock_manuscript"
      ],
      "cannot": [
        "create_journal",
        "create_department",
        "update_user_roles",
        "merge_user_accounts",
        "create_volume",
        "publish_paper",
        "override_decision",
        "change_system_config"
      ]
    },
    "admin": {
      "can": [
        "register",
        "login",
        "create_journal",
        "create_department",
        "merge_department",
        "update_user_roles",
        "merge_user_accounts",
        "create_volume",
        "publish_paper",
        "view_manuscripts_readonly",
        "view_publication_status",
        "view_system_logs"
      ],
      "cannot": [
        "perform_technical_screening",
        "desk_reject",
        "assign_reviewers",
        "make_final_decision",
        "submit_peer_review",
        "approve_for_publication",
        "override_decision",
        "change_system_config"
      ]
    },
    "super_admin": {
      "can": [
        "register",
        "login",
        "create_admin",
        "define_roles",
        "set_permissions",
        "change_system_config",
        "override_editorial_decision",
        "update_any_user_role",
        "emergency_override",
        "full_system_read"
      ],
      "cannot": []
    }
  },
  "resources": {
    "manuscripts": {
      "author": "own",
      "reviewer": "assigned",
      "associate_editor": "all_assigned",
      "editor_in_chief": "all",
      "admin": "read_only",
      "super_admin": "all"
    },
    "reviews": {
      "author": "own_after_decision",
      "reviewer": "own",
      "associate_editor": "assigned",
      "editor_in_chief": "all",
      "admin": "read_only",
      "super_admin": "all"
    },
    "editor_notes": {
      "author": "none",
      "reviewer": "none",
      "associate_editor": "assigned",
      "editor_in_chief": "all",
      "admin": "none",
      "super_admin": "all"
    },
    "journals": {
      "author": "read_only",
      "reviewer": "read_only",
      "associate_editor": "read_only",
      "editor_in_chief": "read_only",
      "admin": "full",
      "super_admin": "full"
    },
    "departments": {
      "author": "read_only",
      "reviewer": "read_only",
      "associate_editor": "read_only",
      "editor_in_chief": "read_only",
      "admin": "full",
      "super_admin": "full"
    },
    "users": {
      "author": "own",
      "reviewer": "own",
      "associate_editor": "assigned",
      "editor_in_chief": "all",
      "admin": "update_non_admin",
      "super_admin": "full"
    },
    "volumes_issues": {
      "author": "read_only",
      "reviewer": "read_only",
      "associate_editor": "read_only",
      "editor_in_chief": "read_only",
      "admin": "full",
      "super_admin": "full"
    },
    "audit_logs": {
      "author": "none",
      "reviewer": "none",
      "associate_editor": "none",
      "editor_in_chief": "read_only",
      "admin": "read_only",
      "super_admin": "full"
    },
    "system_config": {
      "author": "none",
      "reviewer": "none",
      "associate_editor": "none",
      "editor_in_chief": "none",
      "admin": "none",
      "super_admin": "full"
    }
  }
}

