class TokenBlacklist < ApplicationRecord
    validates :token, presence: true, uniqueness: true
end
