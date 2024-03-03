class UserMoviesController < ApplicationController
  before_action :authenticate_user!
  skip_before_action :verify_authenticity_token

  def create
    @movie = Movie.find(params[:movie_id])

    token = request.headers['Authorization']&.split(' ')&.last
    decoded_token = JWT.decode(token, Rails.application.credentials.secret_key_base, true, algorithm: 'HS256').first

    if decoded_token && user_id = decoded_token['user_id']
        @current_user = User.find_by(id: user_id)
        
        @current_user.movies << @movie
        @user_movie = @current_user.user_movies.find_by(movie_id: @movie.id)
        @user_movie.update(score: params[:score])
        
        respond_to do |format|
            format.json { render json: @user_movie.to_json, status: :created }
        end

    end
  end

  def update
    @user_movie = current_user.user_movies.find_by(movie_id: params[:user_movie][:movie_id])
    @user_movie.update(score: params[:user_movie][:score])
    redirect_to movies_path
  end
end
