class SessionsController < ApplicationController
    before_action :authenticate_user!, only: [:destroy]
    skip_before_action :verify_authenticity_token

    def new
    end

    def destroy
        # Realiza logout, fazendo com que o JWT seja adicionado à uma Blacklist
        token = request.headers['Authorization']&.split(' ')&.last
        if token
            TokenBlacklist.create(token: token)
            Rails.logger.info("Token added to blacklist: #{token}")
            render json: { msg: 'Logout done' }, status: :not_found
        else
            render json: { error: 'Token not found' }, status: :not_found
        end
    end

    
    def create
        user = User.find_by(email: params[:email])

        # Gera um JWT
        if user && user.authenticate(params[:password])
            payload = { user_id: user.id, exp: Time.now.to_i + 3600 }
            token = JWT.encode(payload, Rails.application.credentials.secret_key_base, 'HS256')
            render json: { token: token }
        else
            render json: { error: 'Invalid credentials' }, status: :unauthorized
        end
    end
end
