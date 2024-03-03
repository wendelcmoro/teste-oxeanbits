class UsersController < ApplicationController
    before_action :authenticate_user!
    skip_before_action :verify_authenticity_token

    def new
        @user = User.new
    end

    def create
        @user = User.new(user_params)
        if @user.save
            respond_to do |format|
                format.json { render json: @user.to_json, status: :created }
            end
        else
            respond_to do |format|
                format.json { render json: "error", status: :error }
            end
        end
    end

    private

    def user_params
        params.require(:user).permit(:username, :email, :password, :password_confirmation)
    end
end
