require 'csv'

class CsvController < ApplicationController
    before_action :authenticate_user!
    skip_before_action :verify_authenticity_token

    def import_movies
        csv_file = params[:csv_file]
        csv_file_path = params[:csv_file].tempfile.path
        temp_csv_path = File.join(Dir.tmpdir, "#{SecureRandom.hex(8)}.csv")

        # Salvar temporariamente o arquivo CSV
        File.open(temp_csv_path, 'wb') do |file|
            file.write(csv_file.read)
        end

        # Envia o caminho e o tipo de importação para o sidekiq processar em segundo plano
        CsvWorker.perform_async(temp_csv_path, 'import_movies')

        respond_to do |format|
            format.json { render json: "Movies will be processed in background!" }
        end
    end

    def import_scores
        csv_file = params[:csv_file]
        csv_file_path = params[:csv_file].tempfile.path
        temp_csv_path = File.join(Dir.tmpdir, "#{SecureRandom.hex(8)}.csv")

        # Salvar temporariamente o arquivo CSV
        File.open(temp_csv_path, 'wb') do |file|
            file.write(csv_file.read)
        end

        # Envia o caminho e o tipo de importação para o sidekiq processar em segundo plano
        CsvWorker.perform_async(temp_csv_path, 'import_scores')
    
        respond_to do |format|
            format.json { render json: "Movies Scores will be processed in background!" }
        end
    end
end
