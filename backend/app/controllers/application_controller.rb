class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
  helper_method :current_user, :logged_in?

  private

  def current_user
    @current_user ||= User.find(session[:user_id]) if session[:user_id]
  end

  def logged_in?
    !!current_user
  end

  def authenticate_user!    
    token = request.headers['Authorization']&.split(' ')&.last
    decoded_token = JWT.decode(token, Rails.application.credentials.secret_key_base, true, algorithm: 'HS256').first

    user_id = decoded_token['user_id']

    rescue JWT::ExpiredSignature
        render json: { error: 'Token expired' }, status: :unauthorized
    rescue JWT::DecodeError => e
        Rails.logger.error("Filed to decode tokenn: #{e.message}")
        render json: { error: 'Invalid token' }, status: :unauthorized
  end
end
