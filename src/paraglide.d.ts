declare module "@/paraglide/messages" {
  export function api_error_unexpected_detail(): string
  export function api_error_unexpected_title(): string
  export function api_problem_bad_request(
    inputs?: Record<string, string>
  ): string
  export function api_problem_unauthorized(
    inputs?: Record<string, string>
  ): string
  export function api_problem_forbidden(inputs?: Record<string, string>): string
  export function api_problem_not_found(inputs?: Record<string, string>): string
  export function api_problem_conflict(inputs?: Record<string, string>): string
  export function api_problem_validation_failed(
    inputs?: Record<string, string>
  ): string
  export function api_problem_rate_limited(
    inputs?: Record<string, string>
  ): string
  export function api_problem_internal_server_error(
    inputs?: Record<string, string>
  ): string
  export function api_problem_auth_flow_disabled(
    inputs?: Record<string, string>
  ): string
  export function api_problem_invitation_not_valid(
    inputs?: Record<string, string>
  ): string
  export function api_problem_invitation_expired(
    inputs?: Record<string, string>
  ): string
  export function api_problem_invitation_target_identity_not_found(
    inputs?: Record<string, string>
  ): string
  export function api_problem_enrollment_case_not_found(
    inputs?: Record<string, string>
  ): string
  export function api_problem_enrollment_case_invalid_state(
    inputs?: Record<string, string>
  ): string
  export function api_problem_enrollment_case_revision_conflict(
    inputs?: Record<string, string>
  ): string
  export function api_problem_enrollment_candidate_not_found(
    inputs?: Record<string, string>
  ): string
  export function api_problem_active_enrollment_already_exists(
    inputs?: Record<string, string>
  ): string
  export function api_problem_class_group_capacity_exceeded(
    inputs?: Record<string, string>
  ): string
  export function api_problem_card_access_locked(
    inputs?: Record<string, string>
  ): string
  export function api_problem_idempotency_conflict(
    inputs?: Record<string, string>
  ): string
  export function api_problem_idempotency_key_required(
    inputs?: Record<string, string>
  ): string
  export function api_problem_parent_identity_not_found(
    inputs?: Record<string, string>
  ): string
  export function api_problem_school_context_authentication_required(
    inputs?: Record<string, string>
  ): string
  export function api_problem_schedule_school_year_closed(
    inputs?: Record<string, string>
  ): string
  export function api_problem_user_profile_not_found(
    inputs?: Record<string, string>
  ): string
  export function api_problem_period_id_required(
    inputs?: Record<string, string>
  ): string
  export function api_problem_card_not_found(
    inputs?: Record<string, string>
  ): string
  export function api_problem_card_invalid(
    inputs?: Record<string, string>
  ): string
  export function api_problem_presence_already_recorded(
    inputs?: Record<string, string>
  ): string
  export function api_problem_no_entry_recorded(
    inputs?: Record<string, string>
  ): string
  export function api_problem_presence_event_not_found(
    inputs?: Record<string, string>
  ): string
  export function api_problem_presence_event_identity_missing(
    inputs?: Record<string, string>
  ): string
  export function api_problem_pickup_identity_required(
    inputs?: Record<string, string>
  ): string
  export function api_problem_pickup_identity_not_found(
    inputs?: Record<string, string>
  ): string
  export function api_problem_pickup_override_reason_required(
    inputs?: Record<string, string>
  ): string
  export function api_problem_companion_session_not_found(
    inputs?: Record<string, string>
  ): string
  export function api_problem_companion_session_forbidden(
    inputs?: Record<string, string>
  ): string
  export function api_problem_companion_session_invalid_token(
    inputs?: Record<string, string>
  ): string
  export function api_problem_companion_session_invalid_target(
    inputs?: Record<string, string>
  ): string
  export function api_problem_companion_session_bound(
    inputs?: Record<string, string>
  ): string
  export function api_problem_companion_session_gone(
    inputs?: Record<string, string>
  ): string
  export function api_problem_identity_enrollment_not_found(
    inputs?: Record<string, string>
  ): string
  export function api_problem_date_range_too_large(
    inputs?: Record<string, string>
  ): string
  export function api_problem_justification_already_submitted(
    inputs?: Record<string, string>
  ): string
  export function api_problem_justification_not_found(
    inputs?: Record<string, string>
  ): string
  export function api_problem_course_attendance_session_not_found(
    inputs?: Record<string, string>
  ): string
  export function api_problem_schedule_slot_not_found(
    inputs?: Record<string, string>
  ): string
  export function api_problem_subject_level_not_found(
    inputs?: Record<string, string>
  ): string
  export function api_problem_invalid_status_filter(
    inputs?: Record<string, string>
  ): string
  export function api_problem_invalid_status_transition(
    inputs?: Record<string, string>
  ): string
  export function api_problem_invalid_student_enrollments(
    inputs?: Record<string, string>
  ): string
  export function api_problem_invalid_grade(
    inputs?: Record<string, string>
  ): string
  export function api_problem_import_enrollment_not_found(
    inputs?: Record<string, string>
  ): string
  export function api_problem_import_score_required(
    inputs?: Record<string, string>
  ): string
  export function api_problem_import_score_out_of_range(
    inputs?: Record<string, string>
  ): string
  export function api_problem_import_comment_too_long(
    inputs?: Record<string, string>
  ): string
  export function api_problem_class_group_code_duplicate(
    inputs?: Record<string, string>
  ): string
  export function api_problem_installments_sum_mismatch(
    inputs?: Record<string, string>
  ): string
  export function api_problem_no_outstanding_balance(
    inputs?: Record<string, string>
  ): string
  export function api_problem_overpayment(
    inputs?: Record<string, string>
  ): string
  export function api_problem_payment_not_found(
    inputs?: Record<string, string>
  ): string
  export function api_problem_receipt_not_found(
    inputs?: Record<string, string>
  ): string
  export function api_problem_receipt_code_not_found(
    inputs?: Record<string, string>
  ): string
  export function api_problem_schedule_critical_conflicts(
    inputs?: Record<string, string>
  ): string
  export function api_problem_schedule_warnings(
    inputs?: Record<string, string>
  ): string
  export function api_problem_school_data(
    inputs?: Record<string, string>
  ): string
  export function api_problem_school_code_collision(
    inputs?: Record<string, string>
  ): string
  export function api_field_invalid_type(
    inputs?: Record<string, string>
  ): string
  export function api_field_too_small(inputs?: Record<string, string>): string
  export function api_field_too_big(inputs?: Record<string, string>): string
  export function api_field_invalid_format(
    inputs?: Record<string, string>
  ): string
  export function api_field_unrecognized_keys(
    inputs?: Record<string, string>
  ): string
  export function api_field_invalid_value(
    inputs?: Record<string, string>
  ): string
  export function api_field_required(inputs?: Record<string, string>): string
  export function app_badge(): string
  export function app_card_login(): string
  export function app_continue(): string
  export function app_description(): string
  export function app_desktop_description(): string
  export function app_desktop_title(): string
  export function app_eyebrow(): string
  export function app_shell_description(): string
  export function app_shell_title(): string
  export function app_title(): string
  export function auth_back(): string
  export function auth_back_to_login(): string
  export function auth_badge(): string
  export function auth_card_login_action(): string
  export function auth_card_login_camera_error(): string
  export function auth_card_login_camera_requesting(): string
  export function auth_card_login_camera_unsupported(): string
  export function auth_card_login_description(): string
  export function auth_card_login_eyebrow(): string
  export function auth_card_login_invalid_qr(): string
  export function auth_card_login_manual_description(): string
  export function auth_card_login_manual_label(): string
  export function auth_card_login_manual_payload_required(): string
  export function auth_card_login_manual_submit(): string
  export function auth_card_login_manual_title(): string
  export function auth_card_login_pending_action(): string
  export function auth_card_login_processing(): string
  export function auth_card_login_title(): string
  export function auth_description(): string
  export function auth_email_label(): string
  export function auth_forgot_password(): string
  export function auth_hide_password(): string
  export function auth_invitation_hint(): string
  export function auth_later(): string
  export function auth_loading_description(): string
  export function auth_loading_title(): string
  export function auth_login_action(): string
  export function auth_login_description(): string
  export function auth_login_error(): string
  export function auth_login_title(): string
  export function auth_notifications_allow(): string
  export function auth_notifications_description(inputs: {
    name: string
  }): string
  export function auth_notifications_grades(): string
  export function auth_notifications_payments(): string
  export function auth_notifications_presence(): string
  export function auth_notifications_title(): string
  export function auth_no_profile_description(): string
  export function auth_no_profile_title(): string
  export function auth_or(): string
  export function auth_password_hint(): string
  export function auth_password_label(): string
  export function auth_profile_without_school(): string
  export function auth_profiles_description(): string
  export function auth_profiles_title(): string
  export function auth_retry(): string
  export function auth_school_pending(): string
  export function auth_show_password(): string
  export function auth_skip(): string
  export function auth_splash_methods(): string
  export function auth_splash_tagline(): string
  export function auth_title(): string
  export function language_en(): string
  export function language_fr(): string
  export function language_label(): string
  export function mobile_absents_label(): string
  export function mobile_activity_arrival(): string
  export function mobile_activity_arrival_subtitle(): string
  export function mobile_activity_due(): string
  export function mobile_activity_due_subtitle(): string
  export function mobile_activity_message(): string
  export function mobile_activity_message_subtitle(): string
  export function mobile_activity_report(): string
  export function mobile_activity_report_subtitle(): string
  export function mobile_average(): string
  export function mobile_back(): string
  export function mobile_cancel(): string
  export function mobile_child(): string
  export function mobile_close(): string
  export function mobile_comment(): string
  export function mobile_dashboard_error_description(): string
  export function mobile_dashboard_error_title(): string
  export function mobile_dashboard_loading(): string
  export function mobile_date(): string
  export function mobile_download(): string
  export function mobile_due(): string
  export function mobile_finish_session(): string
  export function mobile_last_grade(): string
  export function mobile_message_accounting_text(): string
  export function mobile_message_direction_text(): string
  export function mobile_message_teacher_role(): string
  export function mobile_message_teacher_text(): string
  export function mobile_messages_subtitle(): string
  export function mobile_nav_notifications(): string
  export function mobile_nav_courses(): string
  export function mobile_nav_grades(): string
  export function mobile_nav_home(): string
  export function mobile_nav_messages(): string
  export function mobile_nav_payments(): string
  export function mobile_nav_profile(): string
  export function mobile_nav_reports(): string
  export function mobile_nav_scan(): string
  export function mobile_nav_subjects(): string
  export function mobile_nav_today(): string
  export function mobile_new(): string
  export function mobile_next(): string
  export function mobile_now(): string
  export function mobile_no_balance_description(): string
  export function mobile_no_balance_title(): string
  export function mobile_no_evaluation(): string
  export function mobile_no_receipt_description(): string
  export function mobile_no_receipt_title(): string
  export function mobile_no_student_balance_description(): string
  export function mobile_open_report(): string
  export function mobile_open_receipt(): string
  export function mobile_open_scan(): string
  export function mobile_paid(): string
  export function mobile_paid_up(): string
  export function mobile_parent_activity(): string
  export function mobile_home_modules_title(): string
  export function mobile_home_upcoming_evaluations_empty_description(): string
  export function mobile_home_upcoming_evaluations_empty_title(): string
  export function mobile_home_upcoming_evaluations_title(): string
  export function mobile_evaluation_type_default(): string
  export function mobile_evaluation_type_exam(): string
  export function mobile_evaluation_type_homework(): string
  export function mobile_evaluation_type_oral(): string
  export function mobile_evaluation_type_project(): string
  export function mobile_evaluation_type_quiz(): string
  export function mobile_module_payments_description(): string
  export function mobile_module_payments_student_description(): string
  export function mobile_module_presence_description(): string
  export function mobile_module_presence_student_description(): string
  export function mobile_module_evaluations_description(): string
  export function mobile_module_reports_description(): string
  export function mobile_module_schedule_description(): string
  export function mobile_module_subjects_description(): string
  export function mobile_module_teacher_grades_description(): string
  export function mobile_module_teacher_messages_description(): string
  export function mobile_module_teacher_scan_description(): string
  export function mobile_parent_amount_due(): string
  export function mobile_parent_children(): string
  export function mobile_parent_family_clear(): string
  export function mobile_parent_greeting(): string
  export function mobile_parent_greeting_name(inputs: { name: string }): string
  export function mobile_parent_highlight_action(): string
  export function mobile_parent_highlight_description(): string
  export function mobile_parent_highlight_description_dynamic(inputs: {
    average: string
    rank: string
  }): string
  export function mobile_parent_highlight_label(): string
  export function mobile_parent_highlight_title(): string
  export function mobile_parent_highlight_title_child(inputs: {
    name: string
  }): string
  export function mobile_parent_no_child_description(): string
  export function mobile_parent_no_child_title(): string
  export function mobile_parent_no_due(): string
  export function mobile_parent_today(): string
  export function mobile_payment_alert(): string
  export function mobile_payment_activity(): string
  export function mobile_payment_cash_only(): string
  export function mobile_payment_due(): string
  export function mobile_payment_due_date(inputs: { date: string }): string
  export function mobile_payment_due_for_child(inputs: {
    child: string
    date: string
  }): string
  export function mobile_payment_family_balance(): string
  export function mobile_payment_last_receipt(): string
  export function mobile_payment_next_due(): string
  export function mobile_payment_overdue_since(inputs: {
    child: string
    date: string
  }): string
  export function mobile_payment_overdue_since_short(inputs: {
    date: string
  }): string
  export function mobile_payment_pending_count(inputs: {
    count: number
  }): string
  export function mobile_payment_progress_percent(inputs: {
    percent: number
  }): string
  export function mobile_payment_progress_title(): string
  export function mobile_payment_tab_progress(): string
  export function mobile_payment_tab_activity(): string
  export function mobile_payment_received_cash(): string
  export function mobile_payment_remaining_due(): string
  export function mobile_payment_student_unknown(): string
  export function mobile_payment_top_child(): string
  export function mobile_payment_total_billed(): string
  export function mobile_payments_due_tab(): string
  export function mobile_payments_history_limited_description(): string
  export function mobile_payments_history_limited_student_description(): string
  export function mobile_payments_history_limited_title(): string
  export function mobile_payments_history_tab(): string
  export function mobile_payments_summary(inputs: {
    paid: string
    total: string
  }): string
  export function mobile_payments_subtitle(): string
  export function mobile_pay_now(): string
  export function mobile_pdf(): string
  export function mobile_pending(): string
  export function mobile_presents_label(): string
  export function mobile_notifications_all_read(): string
  export function mobile_notifications_center(): string
  export function mobile_notifications_description(): string
  export function mobile_notifications_empty_description(): string
  export function mobile_notifications_empty_title(): string
  export function mobile_notifications_mark_all_error(): string
  export function mobile_notifications_mark_all_read(): string
  export function mobile_notifications_subtitle(): string
  export function mobile_notifications_unread_count(inputs: {
    count: number
  }): string
  export function mobile_presence(): string
  export function mobile_presence_absences(): string
  export function mobile_presence_acknowledged(): string
  export function mobile_presence_calendar_tab(): string
  export function mobile_presence_day_details_title(): string
  export function mobile_presence_day_students(): string
  export function mobile_presence_day_status(): string
  export function mobile_presence_duration(): string
  export function mobile_presence_entry(): string
  export function mobile_presence_exit(): string
  export function mobile_presence_history_empty_description(): string
  export function mobile_presence_history_empty_title(): string
  export function mobile_presence_history_tab(): string
  export function mobile_presence_justified(): string
  export function mobile_presence_justification(): string
  export function mobile_presence_late_minutes(inputs: {
    minutes: unknown
  }): string
  export function mobile_presence_lates(): string
  export function mobile_presence_next_month(): string
  export function mobile_presence_no_child_description(): string
  export function mobile_presence_no_child_title(): string
  export function mobile_presence_not_recorded(): string
  export function mobile_presence_pending(): string
  export function mobile_presence_planned_absences(): string
  export function mobile_presence_previous_month(): string
  export function mobile_presence_rate(): string
  export function mobile_presence_reason_family(): string
  export function mobile_presence_reason_medical(): string
  export function mobile_presence_reason_other(): string
  export function mobile_presence_reason_other_short(): string
  export function mobile_presence_reason_transport(): string
  export function mobile_presence_reason_sick(): string
  export function mobile_presence_justify_late_title(): string
  export function mobile_presence_justification_sent(): string
  export function mobile_presence_send_justification(): string
  export function mobile_presence_report_absence(): string
  export function mobile_presence_report_comment_example(): string
  export function mobile_presence_report_error(): string
  export function mobile_presence_report_hint(): string
  export function mobile_presence_report_missing_child(): string
  export function mobile_presence_report_sent(): string
  export function mobile_presence_schedule_basis(): string
  export function mobile_presence_send_to_school(): string
  export function mobile_presence_subtitle(): string
  export function mobile_previous_reports(): string
  export function mobile_permission_denied(): string
  export function mobile_permission_granted(): string
  export function mobile_permission_prompt(): string
  export function mobile_permission_unknown(): string
  export function mobile_permission_unsupported(): string
  export function mobile_profile_app_language(): string
  export function mobile_profile_app_installed(): string
  export function mobile_profile_app_installed_hint(): string
  export function mobile_profile_business_notifications_description(): string
  export function mobile_profile_camera_drawer_description(): string
  export function mobile_profile_camera_permission(): string
  export function mobile_profile_camera_permission_error(): string
  export function mobile_profile_channel_email(): string
  export function mobile_profile_channel_push(): string
  export function mobile_profile_client_settings(): string
  export function mobile_profile_client_settings_hint(): string
  export function mobile_profile_current_school(): string
  export function mobile_profile_first_name(): string
  export function mobile_profile_language_drawer_description(): string
  export function mobile_profile_last_name(): string
  export function mobile_profile_logout(): string
  export function mobile_profile_no_email(): string
  export function mobile_profile_notification_channels(): string
  export function mobile_profile_notification_grades(): string
  export function mobile_profile_notification_payments(): string
  export function mobile_profile_notification_presence(): string
  export function mobile_profile_notification_system(): string
  export function mobile_profile_notifications(): string
  export function mobile_profile_notifications_drawer_description(): string
  export function mobile_profile_notifications_hint(): string
  export function mobile_profile_password(): string
  export function mobile_profile_permission_denied_help(): string
  export function mobile_profile_permission_enable(): string
  export function mobile_profile_permission_enabled(): string
  export function mobile_profile_permission_status(): string
  export function mobile_profile_permission_unsupported_help(): string
  export function mobile_profile_personal(): string
  export function mobile_profile_personal_drawer_description(): string
  export function mobile_profile_personal_hint(): string
  export function mobile_profile_phone(): string
  export function mobile_profile_phone_security_hint(): string
  export function mobile_profile_preferences_error(): string
  export function mobile_profile_preferences_saved(): string
  export function mobile_profile_security(): string
  export function mobile_profile_security_drawer_description(): string
  export function mobile_profile_security_hint(): string
  export function mobile_profile_security_unavailable(): string
  export function mobile_profile_schools(): string
  export function mobile_profile_schools_drawer_description(): string
  export function mobile_profile_schools_hint(): string
  export function mobile_profile_save(): string
  export function mobile_profile_save_error(): string
  export function mobile_profile_saved(): string
  export function mobile_profile_subtitle(): string
  export function mobile_profile_switch_school(): string
  export function mobile_profile_push_permission(): string
  export function mobile_profile_system_language(): string
  export function mobile_profile_two_factor(): string
  export function mobile_profile_unavailable(): string
  export function mobile_profile_unknown_name(): string
  export function mobile_rank(): string
  export function mobile_ready(): string
  export function mobile_reason(): string
  export function mobile_receipt_download_error(): string
  export function mobile_receipt_preview_title(): string
  export function mobile_receipt_unavailable(): string
  export function mobile_filter(): string
  export function mobile_reports_available_since(inputs: {
    date: unknown
  }): string
  export function mobile_reports_bulletin_published(inputs: {
    period: unknown
  }): string
  export function mobile_reports_bulletin_unavailable(): string
  export function mobile_reports_bulletin_unavailable_description(): string
  export function mobile_reports_class_average(inputs: {
    average: unknown
  }): string
  export function mobile_reports_evaluation_meta(inputs: {
    date: unknown
    coefficient: unknown
  }): string
  export function mobile_reports_evaluations(): string
  export function mobile_reports_evolution(inputs: { value: unknown }): string
  export function mobile_reports_eyebrow(): string
  export function mobile_reports_last_grade(inputs: { grade: unknown }): string
  export function mobile_reports_last_grade_unavailable(): string
  export function mobile_reports_no_appreciation(): string
  export function mobile_reports_no_evaluation_description(): string
  export function mobile_reports_no_pdf(): string
  export function mobile_reports_no_period_description(): string
  export function mobile_reports_no_period_title(): string
  export function mobile_reports_no_subject_description(): string
  export function mobile_reports_no_subject_title(): string
  export function mobile_reports_payment_blocked(): string
  export function mobile_reports_payment_blocked_description(): string
  export function mobile_reports_period(): string
  export function mobile_reports_period_average(inputs: {
    period: unknown
  }): string
  export function mobile_reports_period_short(): string
  export function mobile_reports_rank_line(inputs: {
    rank: unknown
    total: unknown
  }): string
  export function mobile_reports_rank_unavailable(): string
  export function mobile_reports_results_title(): string
  export function mobile_reports_subject_eyebrow(inputs: {
    child: unknown
    period: unknown
  }): string
  export function mobile_reports_subject_meta(inputs: {
    coefficient: unknown
  }): string
  export function mobile_reports_subjects_title(inputs: {
    period: unknown
  }): string
  export function mobile_reports_subtitle(): string
  export function mobile_reports_teacher_appreciation(): string
  export function mobile_reports_teacher_unavailable(): string
  export function mobile_scan_hint(): string
  export function mobile_scan_presence(): string
  export function mobile_schedule_day(): string
  export function mobile_schedule_day_empty_description(): string
  export function mobile_schedule_day_empty_title(): string
  export function mobile_schedule_day_heading(inputs: {
    day: string
    date: string
  }): string
  export function mobile_schedule_empty_description(): string
  export function mobile_schedule_empty_title(): string
  export function mobile_schedule_eyebrow(): string
  export function mobile_schedule_next_week(): string
  export function mobile_schedule_previous_week(): string
  export function mobile_schedule_week(): string
  export function mobile_schedule_week_of(inputs: { date: string }): string
  export function mobile_subjects_eyebrow(): string
  export function mobile_subjects_title(): string
  export function mobile_subjects_tab_subjects(): string
  export function mobile_subjects_tab_teachers(): string
  export function mobile_subjects_empty_title(): string
  export function mobile_subjects_empty_description(): string
  export function mobile_subjects_teachers_empty_title(): string
  export function mobile_subjects_teachers_empty_description(): string
  export function mobile_status_absent(): string
  export function mobile_status_late(): string
  export function mobile_status_present(): string
  export function mobile_status_present_plural(): string
  export function mobile_status_unknown(): string
  export function mobile_subject_math(): string
  export function mobile_subject_math_short(): string
  export function mobile_students_filled(): string
  export function mobile_students_label(): string
  export function mobile_missing_grades(): string
  export function mobile_teacher_classes(): string
  export function mobile_teacher_greeting(): string
  export function mobile_teacher_greeting_name(inputs: { name: string }): string
  export function mobile_teacher_now(): string
  export function mobile_teacher_no_class_description(): string
  export function mobile_teacher_no_class_title(): string
  export function mobile_teacher_no_course_description(): string
  export function mobile_teacher_no_course_title(): string
  export function mobile_teacher_summary(): string
  export function mobile_teacher_today(): string
  export function mobile_time_yesterday(): string
  export function mobile_to_start(): string
  export function mobile_tuition_t1(): string
  export function mobile_tuition_t2(): string
  export function mobile_tuition_t3(): string
  export function mobile_until_1115(): string
  export function mobile_until_time(inputs: { time: string }): string
  export function mobile_workspace_parent(): string
  export function mobile_workspace_student(): string
  export function mobile_workspace_teacher(): string
  export function mobile_student_space(): string
  export function mobile_student_greeting(): string
  export function mobile_student_greeting_name(inputs: {
    name: NonNullable<unknown>
  }): string
  export function mobile_student_summary(): string
  export function mobile_student_subjects(): string
}

declare module "@/paraglide/runtime" {
  export type Locale = "fr" | "en"
  export const locales: readonly Locale[]
  export function getLocale(): Locale
  export function isLocale(locale: string): locale is Locale
  export function setLocale(
    locale: Locale,
    options?: { reload?: boolean }
  ): void
}

// Node's native test runner resolves the generated runtime through its relative
// `.js` path, while the application uses the `@` alias. Keep both imports typed.
declare module "*paraglide/runtime.js" {
  export type Locale = "fr" | "en"
  export function getLocale(): Locale
}
