require 'csv'

class CsvWorker
    include Sidekiq::Worker
  
    def perform(csv_file_path, type)
        CSV.foreach(csv_file_path, headers: true, col_sep: ';') do |row|

            # Processa CSV para importar filmes
            if type == 'import_movies'
                @movie_params = { title: row['title'], director: row['director'] }

                Rails.logger.info @movie_params
                Rails.logger.info "teste13"

                @movie = Movie.new(@movie_params)
                @movie.save

            # Processa CSV para importar avaliação de filmes
            else 
                @movie_id = row['movie_id']
                @score = row['score']
                @user_id = row['user_id']

                @movie = Movie.find(@movie_id)
                @user = User.find(@user_id)

                @user_movie = @user.user_movies.find_by(movie_id: @movie.id)

                # Verifica se nota para filme do usuário já existe
                # Caso não exista, cria a nota antes de aplicar a atualização do valor
                if @user_movie.nil?
                    @user.movies << @movie
                    @user_movie = @user.user_movies.find_by(movie_id: @movie.id)
                end

                @user_movie.update(score: @score)
            end
        end

        File.delete(csv_file_path) if File.exist?(csv_file_path)
    end
end