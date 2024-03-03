class TokenBlacklistMiddleware
    def initialize(app)
      @app = app
    end
  
    def call(env)
      token = env['HTTP_AUTHORIZATION']&.split(' ')&.last
  
      if token && token_blacklisted?(token)
        [401, { 'Content-Type' => 'application/json' }, [{ error: 'Unauthorized' }.to_json]]
      else
        @app.call(env)
      end
    end
  
    private
  
    def token_blacklisted?(token)
      TokenBlacklist.exists?(token: token)
    end
  end