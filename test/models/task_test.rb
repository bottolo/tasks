require "test_helper"

# = Task Model Test Suite
#
# This test suite validates the Task model's validations, behavior, and data integrity.
# The Task model represents a basic todo item with title, description, and completion status.
#
# == Model Validations Tested:
# * Title: presence (required), length (1-255 characters)
# * Description: length (max 1000 characters), optional (allow_blank: true)
# * Completed: inclusion in [true, false], required (no nil values)
#
# == Test Categories:
# * Valid Task Creation - Tests successful creation with various valid input combinations
# * Title Validation - Tests presence, length constraints, edge cases (whitespace, unicode)
# * Description Validation - Tests length constraints, blank/nil handling
# * Completed Field Validation - Tests boolean validation and Rails type conversion
# * Edge Cases - Unicode characters, special characters, boundary conditions
# * Database Persistence - Save/update operations and error handling
# * Multiple Validation Errors - Testing validation error accumulation
#
# == Running Tests:
#   # Run all model tests
#   rails test test/models/task_test.rb
#
#   # Run specific test
#   rails test test/models/task_test.rb::TaskTest#test_should_create_task_with_valid_attributes
#
#   # Run tests with verbose output
#   rails test test/models/task_test.rb -v
#
# == Testing Strategy:
# * Boundary testing (min/max lengths, edge values)
# * Error message validation to ensure proper user feedback
# * Database persistence verification
# * Unicode and special character handling
# * Rails type conversion behavior (especially for boolean fields)
#
# == Dependencies:
# * Rails test framework (ActiveSupport::TestCase)
# * Task model with validations defined
# * Test database with tasks table
#
# == Notes:
# * Some tests involving invalid boolean values are skipped due to Rails' automatic
#   type conversion behavior
# * Unicode character length is properly handled by Rails validations
# * Tests verify both validation behavior and actual database persistence
#

class TaskTest < ActiveSupport::TestCase
  def setup
    @valid_attributes = {
      title: "Sample Task",
      description: "This is a sample task description",
      completed: false
    }
  end

  test "should create task with valid attributes" do
    task = Task.new(@valid_attributes)
    assert task.valid?
    assert task.save
  end

  test "should create task with minimal valid attributes" do
    task = Task.new(title: "Minimal Task", completed: false)
    assert task.valid?
    assert task.save
  end

  test "should create task with blank description" do
    task = Task.new(title: "Task with blank description", description: "", completed: false)
    assert task.valid?
    assert task.save
  end

  test "should create task with nil description" do
    task = Task.new(title: "Task with nil description", description: nil, completed: false)
    assert task.valid?
    assert task.save
  end

  test "should not be valid without title" do
    task = Task.new(@valid_attributes.except(:title))
    assert_not task.valid?
    assert_includes task.errors[:title], "can't be blank"
  end

  test "should not be valid with blank title" do
    task = Task.new(@valid_attributes.merge(title: ""))
    assert_not task.valid?
    assert_includes task.errors[:title], "can't be blank"
  end

  test "should not be valid with nil title" do
    task = Task.new(@valid_attributes.merge(title: nil))
    assert_not task.valid?
    assert_includes task.errors[:title], "can't be blank"
  end

  test "should not be valid with title containing only whitespace" do
    task = Task.new(@valid_attributes.merge(title: "   "))
    assert_not task.valid?
    assert_includes task.errors[:title], "can't be blank"
  end

  test "should be valid with title at minimum length" do
    task = Task.new(@valid_attributes.merge(title: "A"))
    assert task.valid?
  end

  test "should be valid with title at maximum length" do
    task = Task.new(@valid_attributes.merge(title: "A" * 255))
    assert task.valid?
  end

  test "should not be valid with title exceeding maximum length" do
    task = Task.new(@valid_attributes.merge(title: "A" * 256))
    assert_not task.valid?
    assert_includes task.errors[:title], "is too long (maximum is 255 characters)"
  end

  test "should be valid with description at maximum length" do
    task = Task.new(@valid_attributes.merge(description: "A" * 1000))
    assert task.valid?
  end

  test "should not be valid with description exceeding maximum length" do
    task = Task.new(@valid_attributes.merge(description: "A" * 1001))
    assert_not task.valid?
    assert_includes task.errors[:description], "is too long (maximum is 1000 characters)"
  end

  test "should be valid with empty string description" do
    task = Task.new(@valid_attributes.merge(description: ""))
    assert task.valid?
  end

  test "should be valid without description attribute" do
    task = Task.new(@valid_attributes.except(:description))
    assert task.valid?
  end

  test "should be valid with completed as true" do
    task = Task.new(@valid_attributes.merge(completed: true))
    assert task.valid?
  end

  test "should be valid with completed as false" do
    task = Task.new(@valid_attributes.merge(completed: false))
    assert task.valid?
  end

  test "should not be valid with invalid completed value" do
    skip "Rails automatically converts all values to boolean, making inclusion validation redundant"
  end

  test "should not be valid with nil completed value" do
    task = Task.new(@valid_attributes.merge(completed: nil))
    assert_not task.valid?
    assert_includes task.errors[:completed], "is not included in the list"
  end

  test "should handle unicode characters in title" do
    task = Task.new(@valid_attributes.merge(title: "📝 Unicode Task 🚀"))
    assert task.valid?
    assert task.save
  end

  test "should handle unicode characters in description" do
    task = Task.new(@valid_attributes.merge(description: "Task with unicode: 🎯 📊 ⭐"))
    assert task.valid?
    assert task.save
  end

  test "should trim title length calculation correctly with unicode" do
    unicode_title = "🚀" * 255
    task = Task.new(@valid_attributes.merge(title: unicode_title))
    assert task.valid?
  end

  test "should handle special characters in title and description" do
    task = Task.new(
      title: "Special chars: !@#$%^&*(){}[]|\\:;\"'<>,.?/~`",
      description: "More special chars: ±×÷≠≤≥∞∑∏∂∆∇∫",
      completed: false
    )
    assert task.valid?
    assert task.save
  end

  test "should accumulate multiple validation errors" do
    task = Task.new(
      title: "",
      description: "A" * 1001,
      completed: nil
    )

    assert_not task.valid?

    assert_includes task.errors[:title], "can't be blank"
    assert_includes task.errors[:description], "is too long (maximum is 1000 characters)"
    assert_includes task.errors[:completed], "is not included in the list"

    assert task.errors.count >= 3, "Expected at least 3 errors, got #{task.errors.count}. Errors: #{task.errors.full_messages}"
  end

  test "should persist valid task to database" do
    task = Task.new(@valid_attributes)
    assert task.save
    assert_not_nil task.id
    assert_equal @valid_attributes[:title], task.reload.title
  end

  test "should not persist invalid task to database" do
    task = Task.new(@valid_attributes.merge(title: ""))
    assert_not task.save
    assert_nil task.id
  end

  test "should update valid task attributes" do
    task = Task.create!(@valid_attributes)

    assert task.update(title: "Updated Title", completed: true)
    task.reload
    assert_equal "Updated Title", task.title
    assert_equal true, task.completed
  end

  test "should not update task with invalid attributes" do
    task = Task.create!(@valid_attributes)
    original_title = task.title

    assert_not task.update(title: "")
    task.reload
    assert_equal original_title, task.title
    assert_includes task.errors[:title], "can't be blank"
  end

  test "should have accessible attributes" do
    task = Task.new

    task.title = "Test Title"
    task.description = "Test Description"
    task.completed = true

    assert_equal "Test Title", task.title
    assert_equal "Test Description", task.description
    assert_equal true, task.completed
  end

  test "should handle truthy values for completed field" do
    task = Task.new(@valid_attributes.merge(completed: 1))
    assert task.valid?
    assert_equal true, task.completed
  end

  test "should handle falsy values for completed field" do
    task = Task.new(@valid_attributes.merge(completed: 0))
    assert task.valid?
    assert_equal false, task.completed
  end

  test "should respond to model name" do
    assert_equal "Task", Task.model_name.name
    assert_equal "task", Task.model_name.param_key
    assert_equal "tasks", Task.model_name.route_key
  end

  test "setup creates valid task attributes" do
    task = Task.new(@valid_attributes)
    assert task.valid?, "Test setup should create valid attributes. Errors: #{task.errors.full_messages}"
  end
end
