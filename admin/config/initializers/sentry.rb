# Error tracking, enabled only when SENTRY_DSN is set (runtime variable in Coolify).
if ENV["SENTRY_DSN"].present?
  Sentry.init do |config|
    config.dsn = ENV["SENTRY_DSN"]
    config.breadcrumbs_logger = [ :active_support_logger, :http_logger ]
    config.enabled_environments = %w[ production ]
    # Client and financial data stays out of Sentry.
    config.send_default_pii = false
    config.traces_sample_rate = 0.1
  end
end
