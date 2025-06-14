class Task < ApplicationRecord
  validates :title, presence: true, length: { minimum: 1, maximum: 255 }
  validates :description, length: { maximum: 1000 }, allow_blank: true
  validates :completed, inclusion: { in: [true, false] }
end
