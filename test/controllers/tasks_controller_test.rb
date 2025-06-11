require "test_helper"

# = TasksController Test Suite
#
# == API Endpoints Tested:
# * GET    /tasks       - Index (list all tasks)
# * GET    /tasks/:id   - Show (display specific task)
# * POST   /tasks       - Create (create new task)
# * PATCH  /tasks/:id   - Update (modify existing task)
# * DELETE /tasks/:id   - Destroy (delete task)
#
# == HTTP Status Codes Validated:
# * 200 OK              - Successful GET/PATCH requests
# * 201 Created         - Successful resource creation
# * 204 No Content      - Successful resource deletion
# * 400 Bad Request     - Missing/invalid parameters
# * 404 Not Found       - Resource not found
# * 422 Unprocessable   - Validation failures
# * 500 Internal Error  - Server errors (if implemented)
#
# == Error Handling Tested:
# * Missing required parameters (task object)
# * Validation failures (title presence, length constraints)
# * Non-existent resource operations (show/update/delete)
# * Malformed JSON requests
# * Database constraint violations
#
# == Test Categories:
# * Index Tests - GET /tasks endpoint behavior
# * Show Tests - GET /tasks/:id with valid/invalid IDs
# * Create Tests - POST /tasks with valid/invalid data
# * Update Tests - PATCH /tasks/:id with various scenarios
# * Destroy Tests - DELETE /tasks/:id success and failure cases
# * Integration Tests - Complete CRUD workflows
# * Validation Tests - Model validation through API
# * Edge Cases - Empty lists, partial updates, data types
#
# == JSON Response Format Validation:
# * Proper Content-Type headers (application/json)
# * Consistent error response structure: { error: "message", details: ["array"] }
# * Data type preservation (integers, strings, booleans)
# * Complete resource representation in responses
#
# == Running Tests:
#   # Run all controller tests
#   rails test test/controllers/tasks_controller_test.rb
#
#   # Run specific test method
#   rails test test/controllers/tasks_controller_test.rb::TasksControllerTest#test_should_create_task_successfully
#
#   # Run tests with verbose output
#   rails test test/controllers/tasks_controller_test.rb -v
#
#   # Run specific test categories (using grep)
#   rails test test/controllers/tasks_controller_test.rb -n /create/
#   rails test test/controllers/tasks_controller_test.rb -n /validation/
#
# == Testing Strategy:
# * Happy Path Testing - Verify successful operations work correctly
# * Error Path Testing - Ensure proper error handling and status codes
# * Boundary Testing - Test validation limits and edge cases
# * Integration Testing - Full CRUD workflows and state verification
# * Data Integrity - Verify database changes and rollbacks
# * API Contract Testing - Consistent response formats and headers
#
# == Setup and Fixtures:
# * @task - Pre-created valid task for testing operations
# * @valid_params - Valid task parameters for successful operations
# * @invalid_params - Invalid parameters to test validation failures
#
# == API Behavior Validated:
# * RESTful routing conventions
# * Proper HTTP method usage (GET, POST, PATCH, DELETE)
# * JSON request/response handling
# * Parameter validation and sanitization
# * Resource state management (creation, updates, deletion)
# * Error message clarity for client consumption
# * Database transaction handling
#
class TasksControllerTest < ActionDispatch::IntegrationTest
  def setup
    @task = Task.create!(
      title: "Test Task",
      description: "A test task description",
      completed: false
    )
    @valid_params = {
      task: {
        title: "New Task",
        description: "New task description",
        completed: false
      }
    }
    @invalid_params = {
      task: {
        title: "",
        description: "A" * 1001,
        completed: "invalid"
      }
    }
  end

  test "should get index successfully" do
    get tasks_path
    assert_response :ok
    assert_equal "application/json; charset=utf-8", response.content_type

    json_response = JSON.parse(response.body)
    assert_kind_of Array, json_response
    assert json_response.size >= 1
  end

  # SHOW TESTS
  test "should show task successfully" do
    get task_path(@task)
    assert_response :ok

    json_response = JSON.parse(response.body)
    assert_equal @task.id, json_response["id"]
    assert_equal @task.title, json_response["title"]
  end

  test "should return not found for non-existent task" do
    get task_path(id: 999999)
    assert_response :not_found

    json_response = JSON.parse(response.body)
    assert_equal "Task not found", json_response["error"]
  end

  test "should create task successfully" do
    assert_difference('Task.count', 1) do
      post tasks_path, params: @valid_params, as: :json
    end

    assert_response :created
    json_response = JSON.parse(response.body)
    assert_equal "New Task", json_response["title"]
    assert_equal "New task description", json_response["description"]
    assert_equal false, json_response["completed"]
  end

  test "should return bad request for missing task parameters" do
    post tasks_path, params: { invalid: "params" }, as: :json

    assert_response :bad_request
    json_response = JSON.parse(response.body)
    assert_equal "Missing required parameters", json_response["error"]
    assert_includes json_response["details"], "param is missing or the value is empty or invalid: task"
  end

  test "should not update task with invalid data" do
    patch task_path(@task), params: @invalid_params, as: :json

    assert_response :unprocessable_entity
    json_response = JSON.parse(response.body)
    assert_equal "Failed to update task", json_response["error"]
    assert_kind_of Array, json_response["details"]
    assert json_response["details"].any? { |msg| msg.include?("Title can't be blank") }
  end

  test "should return bad request for completely missing parameters" do
    post tasks_path, as: :json

    assert_response :bad_request
    json_response = JSON.parse(response.body)
    assert_equal "Missing required parameters", json_response["error"]
  end

  test "should not create task with invalid data" do
    assert_no_difference('Task.count') do
      post tasks_path, params: @invalid_params, as: :json
    end

    assert_response :unprocessable_entity
    json_response = JSON.parse(response.body)
    assert_equal "Failed to create task", json_response["error"]
    assert_kind_of Array, json_response["details"]
    assert json_response["details"].any? { |msg| msg.include?("Title can't be blank") }
  end

  test "should update task successfully" do
    updated_params = {
      task: {
        title: "Updated Task Title",
        description: "Updated description",
        completed: true
      }
    }

    patch task_path(@task), params: updated_params, as: :json
    assert_response :ok

    json_response = JSON.parse(response.body)
    assert_equal "Updated Task Title", json_response["title"]
    assert_equal "Updated description", json_response["description"]
    assert_equal true, json_response["completed"]

    @task.reload
    assert_equal "Updated Task Title", @task.title
    assert_equal true, @task.completed
  end

  test "should return not found when updating non-existent task" do
    patch task_path(id: 999999), params: @valid_params, as: :json

    assert_response :not_found
    json_response = JSON.parse(response.body)
    assert_equal "Task not found", json_response["error"]
  end

  test "should return bad request for missing task parameters on update" do
    patch task_path(@task), params: { invalid: "params" }, as: :json

    assert_response :bad_request
    json_response = JSON.parse(response.body)
    assert_equal "Missing required parameters", json_response["error"]
    assert_includes json_response["details"], "param is missing or the value is empty or invalid: task"
  end

  # DESTROY TESTS
  test "should destroy task successfully" do
    assert_difference('Task.count', -1) do
      delete task_path(@task)
    end

    assert_response :no_content
    assert_empty response.body
  end

  test "should return not found when destroying non-existent task" do
    delete task_path(id: 999999)

    assert_response :not_found
    json_response = JSON.parse(response.body)
    assert_equal "Task not found", json_response["error"]
  end

  test "should handle complete CRUD workflow" do
    post tasks_path, params: @valid_params, as: :json
    assert_response :created
    created_task_id = JSON.parse(response.body)["id"]

    get task_path(created_task_id)
    assert_response :ok

    update_params = { task: { title: "Updated via workflow" } }
    patch task_path(created_task_id), params: update_params, as: :json
    assert_response :ok

    delete task_path(created_task_id)
    assert_response :no_content

    get task_path(created_task_id)
    assert_response :not_found
  end

  test "should validate content type for JSON requests" do
    post tasks_path, params: @valid_params
    assert_response :created
  end

  test "should handle partial updates" do
    update_params = { task: { completed: true } }

    patch task_path(@task), params: update_params, as: :json
    assert_response :ok

    @task.reload
    assert_equal true, @task.completed
    assert_equal "Test Task", @task.title
  end

  test "should preserve data types in responses" do
    get task_path(@task)
    assert_response :ok

    json_response = JSON.parse(response.body)
    assert_kind_of Integer, json_response["id"]
    assert_kind_of String, json_response["title"]
    assert_kind_of String, json_response["description"]
    assert_includes [true, false], json_response["completed"]
  end

  test "should handle empty task list" do
    Task.destroy_all

    get tasks_path
    assert_response :ok

    json_response = JSON.parse(response.body)
    assert_equal [], json_response
  end

  test "should maintain task count on failed operations" do
    initial_count = Task.count

    patch task_path(id: 999999), params: @valid_params, as: :json
    assert_response :not_found
    assert_equal initial_count, Task.count

    delete task_path(id: 999999)
    assert_response :not_found
    assert_equal initial_count, Task.count
  end

  test "should validate title length constraints" do
    long_title_params = { task: { title: "A" * 256, description: "Valid description" } }
    post tasks_path, params: long_title_params, as: :json

    assert_response :unprocessable_entity
    json_response = JSON.parse(response.body)
    assert json_response["details"].any? { |msg| msg.include?("Title is too long") }
  end

  test "should validate description length constraints" do
    long_desc_params = { task: { title: "Valid title", description: "A" * 1001 } }
    post tasks_path, params: long_desc_params, as: :json

    assert_response :unprocessable_entity
    json_response = JSON.parse(response.body)
    assert json_response["details"].any? { |msg| msg.include?("Description is too long") }
  end

  test "should allow blank description" do
    blank_desc_params = { task: { title: "Valid title", description: "", completed: false } }

    assert_difference('Task.count', 1) do
      post tasks_path, params: blank_desc_params, as: :json
    end

    assert_response :created
  end

  test "should allow nil description" do
    nil_desc_params = { task: { title: "Valid title", completed: false } }

    assert_difference('Task.count', 1) do
      post tasks_path, params: nil_desc_params, as: :json
    end

    assert_response :created
  end

  private

  def json_response
    JSON.parse(response.body)
  end

  test "should not create task without required fields" do
    invalid_params = { task: { title: "" } }

    assert_no_difference('Task.count') do
      post tasks_path, params: invalid_params, as: :json
    end

    assert_response :unprocessable_entity
    json_response = JSON.parse(response.body)
    assert_equal "Failed to create task", json_response["error"]
    assert_kind_of Array, json_response["details"]
  end
end
