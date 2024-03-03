class MoviesController < ApplicationController
  before_action :authenticate_user!
  skip_before_action :verify_authenticity_token

  def index
    @movies = Movie.all
    respond_to do |format|
      format.json { render json: @movies.to_json(methods: :average_score) }
    end
  end

  def new
    @movie = Movie.new
  end
  
  def create
    @movie = Movie.new(movie_params)
    
    respond_to do |format|
        if @movie.save
            format.json { render json: @movie.to_json(methods: :average_score), status: :created }
        else
            format.json { render json: @movie.errors, status: :unprocessable_entity }
        end
    end
  end

  private

  def movie_params
    params.require(:movie).permit(:title, :director)
  end
end
