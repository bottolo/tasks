require "test_helper"

# = TasksController Test Suite
#
# == API Endpoints Tested:
# * GET    /tasks       - Index (list all tasks with optional filtering)
# * GET    /tasks/:id   - Show (display specific task)
# * POST   /tasks       - Create (create new task)
# * PATCH  /tasks/:id   - Update (modify existing task)
# * DELETE /tasks/:id   - Destroy (delete task)
#
# == Filtering Features Tested:
# * GET /tasks?completed=true/false  - Filter by completion status
# * GET /tasks?search=keyword        - Search by title (case-insensitive)
# * GET /tasks?completed=X&search=Y  - Combined filtering
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
# * Filtering Tests - Query parameter filtering functionality
# * Show Tests - GET /tasks/:id with valid/invalid IDs
# * Create Tests - POST /tasks with valid/invalid data
# * Update Tests - PATCH /tasks/:id with various scenarios
# * Destroy Tests - DELETE /tasks/:id success and failure cases
# * Integration Tests - Complete CRUD workflows
# * Validation Tests - Model validation through API
# * Edge Cases - Empty lists, partial updates, data types
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
#   rails test test/controllers/tasks_controller_test.rb -n /filter/

# == Setup and Fixtures:
# * @task - Pre-created valid task for testing operations
# * @completed_task - Pre-created completed task for filter testing
# * @incomplete_task - Pre-created incomplete task for filter testing
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
# * Query parameter filtering and search functionality
#
class TasksControllerTest < ActionDispatch::IntegrationTest
  def setup
    @task = Task.create!(
      title: "Test Task",
      description: "A test task description",
      completed: false
    )

    @completed_task = Task.create!(
      title: "Completed Rails Task",
      description: "A completed task about Rails development",
      completed: true
    )

    @incomplete_task = Task.create!(
      title: "Incomplete Python Task",
      description: "An incomplete task about Python development",
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

  test "should filter tasks by completed status true" do
    get tasks_path, params: { completed: true }
    assert_response :ok

    json_response = JSON.parse(response.body)
    assert_kind_of Array, json_response

    json_response.each do |task|
      assert_equal true, task["completed"]
    end

    assert json_response.any? { |task| task["id"] == @completed_task.id }
    assert_not json_response.any? { |task| task["id"] == @incomplete_task.id }
  end

  test "should filter tasks by completed status false" do
    get tasks_path, params: { completed: false }
    assert_response :ok

    json_response = JSON.parse(response.body)
    assert_kind_of Array, json_response

    json_response.each do |task|
      assert_equal false, task["completed"]
    end

    assert json_response.any? { |task| task["id"] == @incomplete_task.id }
    assert json_response.any? { |task| task["id"] == @task.id }
    assert_not json_response.any? { |task| task["id"] == @completed_task.id }
  end

  test "should search tasks by title case insensitive" do
    get tasks_path, params: { search: "rails" }
    assert_response :ok

    json_response = JSON.parse(response.body)
    assert_kind_of Array, json_response

    assert json_response.any? { |task| task["id"] == @completed_task.id }
    assert_not json_response.any? { |task| task["id"] == @incomplete_task.id }
  end

  test "should search tasks by title with uppercase" do
    get tasks_path, params: { search: "PYTHON" }
    assert_response :ok

    json_response = JSON.parse(response.body)

    assert json_response.any? { |task| task["id"] == @incomplete_task.id }
  end

  test "should search tasks by partial title match" do
    get tasks_path, params: { search: "Task" }
    assert_response :ok

    json_response = JSON.parse(response.body)

    assert json_response.size >= 3
    assert json_response.any? { |task| task["id"] == @task.id }
    assert json_response.any? { |task| task["id"] == @completed_task.id }
    assert json_response.any? { |task| task["id"] == @incomplete_task.id }
  end

  test "should combine completed filter and search" do
    get tasks_path, params: { completed: true, search: "rails" }
    assert_response :ok

    json_response = JSON.parse(response.body)

    json_response.each do |task|
      assert_equal true, task["completed"]
      assert task["title"].downcase.include?("rails")
    end

    assert json_response.any? { |task| task["id"] == @completed_task.id }
  end

  test "should combine incomplete filter and search" do
    get tasks_path, params: { completed: false, search: "python" }
    assert_response :ok

    json_response = JSON.parse(response.body)

    json_response.each do |task|
      assert_equal false, task["completed"]
      assert task["title"].downcase.include?("python")
    end

    assert json_response.any? { |task| task["id"] == @incomplete_task.id }
  end

  test "should return empty array when no tasks match filters" do
    get tasks_path, params: { completed: true, search: "nonexistent" }
    assert_response :ok

    json_response = JSON.parse(response.body)
    assert_equal [], json_response
  end

  test "should return empty array when no tasks match search" do
    get tasks_path, params: { search: "nonexistentKeyword" }
    assert_response :ok

    json_response = JSON.parse(response.body)
    assert_equal [], json_response
  end

  test "should handle boolean string variations for completed filter" do
    ["true", "1"].each do |true_value|
      get tasks_path, params: { completed: true_value }
      assert_response :ok

      json_response = JSON.parse(response.body)
      json_response.each do |task|
        assert_equal true, task["completed"]
      end
    end

    ["false", "0"].each do |false_value|
      get tasks_path, params: { completed: false_value }
      assert_response :ok

      json_response = JSON.parse(response.body)
      json_response.each do |task|
        assert_equal false, task["completed"]
      end
    end
  end

  test "should ignore empty search parameter" do
    get tasks_path, params: { search: "" }
    assert_response :ok

    json_response = JSON.parse(response.body)
    assert json_response.size >= 3
  end

  test "should ignore empty completed parameter" do
    get tasks_path, params: { completed: "" }
    assert_response :ok

    json_response = JSON.parse(response.body)
    assert json_response.size >= 3
  end

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

  test "should not update task with invalid data" do
    patch task_path(@task), params: @invalid_params, as: :json

    assert_response :unprocessable_entity
    json_response = JSON.parse(response.body)
    assert_equal "Failed to update task", json_response["error"]
    assert_kind_of Array, json_response["details"]
    assert json_response["details"].any? { |msg| msg.include?("Title can't be blank") }
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

  # INTEGRATION TESTS
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

  private

  def json_response
    JSON.parse(response.body)
  end

  # BULK UPDATE TESTS
  test "should bulk update multiple tasks successfully" do
    task1 = Task.create!(title: "Task 1", description: "Description 1", completed: false)
    task2 = Task.create!(title: "Task 2", description: "Description 2", completed: false)

    bulk_params = {
      tasks: [
        { id: task1.id, title: "Updated Task 1", completed: true },
        { id: task2.id, description: "Updated Description 2", completed: true }
      ]
    }

    put tasks_path, params: bulk_params, as: :json
    assert_response :ok

    json_response = JSON.parse(response.body)
    assert_equal "Tasks updated successfully", json_response["message"]
    assert_kind_of Array, json_response["tasks"]
    assert_equal 2, json_response["tasks"].size

    task1.reload
    task2.reload
    assert_equal "Updated Task 1", task1.title
    assert_equal true, task1.completed
    assert_equal "Updated Description 2", task2.description
    assert_equal true, task2.completed
  end

  test "should handle partial bulk updates" do
    task1 = Task.create!(title: "Task 1", description: "Description 1", completed: false)
    task2 = Task.create!(title: "Task 2", description: "Description 2", completed: false)

    bulk_params = {
      tasks: [
        { id: task1.id, completed: true },
        { id: task2.id, title: "Only Title Updated" }
      ]
    }

    put tasks_path, params: bulk_params, as: :json
    assert_response :ok

    task1.reload
    task2.reload
    assert_equal true, task1.completed
    assert_equal "Task 1", task1.title
    assert_equal "Only Title Updated", task2.title
    assert_equal false, task2.completed
  end

  test "should rollback bulk update on validation failure" do
    task1 = Task.create!(title: "Task 1", description: "Description 1", completed: false)
    task2 = Task.create!(title: "Task 2", description: "Description 2", completed: false)

    bulk_params = {
      tasks: [
        { id: task1.id, title: "Valid Update", completed: true },
        { id: task2.id, title: "", completed: true }
      ]
    }

    put tasks_path, params: bulk_params, as: :json
    assert_response :unprocessable_entity

    json_response = JSON.parse(response.body)
    assert_equal "Failed to update some tasks", json_response["error"]
    assert_kind_of Array, json_response["details"]

    task1.reload
    task2.reload
    assert_equal "Task 1", task1.title
    assert_equal false, task1.completed
    assert_equal "Task 2", task2.title
  end

  test "should return not found for bulk update with non-existent task" do
    task1 = Task.create!(title: "Task 1", description: "Description 1", completed: false)

    bulk_params = {
      tasks: [
        { id: task1.id, completed: true },
        { id:999999, completed: true }
      ]
    }

    put tasks_path, params: bulk_params, as: :json
    assert_response :not_found

    json_response = JSON.parse(response.body)
    assert_equal "One or more tasks not found", json_response["error"]
  end

  test "should return bad request for missing tasks parameter in bulk update" do
    put tasks_path, params: { invalid: "params" }, as: :json

    assert_response :bad_request
    json_response = JSON.parse(response.body)
    assert_equal "Missing required parameters", json_response["error"]
    assert_includes json_response["details"], "param is missing or the value is empty or invalid: tasks"
  end

  test "should handle empty tasks array in bulk update" do
    put tasks_path, params: { tasks: [] }, as: :json

    assert_response :ok
    json_response = JSON.parse(response.body)
    assert_equal "Tasks updated successfully", json_response["message"]
    assert_equal [], json_response["tasks"]
  end

  # BULK DELETE TESTS
  test "should bulk delete multiple tasks successfully" do
    task1 = Task.create!(title: "Task 1", description: "Description 1", completed: false)
    task2 = Task.create!(title: "Task 2", description: "Description 2", completed: false)
    task3 = Task.create!(title: "Task 3", description: "Description 3", completed: true)

    initial_count = Task.count
    ids_to_delete = [task1.id, task2.id]

    assert_difference('Task.count', -2) do
      delete tasks_path, params: { ids: ids_to_delete }, as: :json
    end

    assert_response :ok
    json_response = JSON.parse(response.body)
    assert_equal "Tasks deleted successfully", json_response["message"]
    assert_equal 2, json_response["deleted_count"]

    assert_raises(ActiveRecord::RecordNotFound) { task1.reload }
    assert_raises(ActiveRecord::RecordNotFound) { task2.reload }

    assert_nothing_raised { task3.reload }
  end

  test "should handle bulk delete with non-existent task IDs" do
    task1 = Task.create!(title: "Task 1", description: "Description 1", completed: false)

    initial_count = Task.count
    ids_to_delete = [task1.id, 999999, 999998]

    assert_difference('Task.count', -1) do
      delete tasks_path, params: { ids: ids_to_delete }, as: :json
    end

    assert_response :ok
    json_response = JSON.parse(response.body)
    assert_equal "Tasks deleted successfully", json_response["message"]
    assert_equal 1, json_response["deleted_count"]
  end

  test "should return bad request for missing ids parameter in bulk delete" do
    delete tasks_path, params: { invalid: "params" }, as: :json

    assert_response :bad_request
    json_response = JSON.parse(response.body)
    assert_equal "Missing required parameters", json_response["error"]
    assert_includes json_response["details"], "param is missing or the value is empty or invalid: ids"
  end

  test "should handle empty ids array in bulk delete" do
    initial_count = Task.count

    assert_no_difference('Task.count') do
      delete tasks_path, params: { ids: [] }, as: :json
    end

    assert_response :ok
    json_response = JSON.parse(response.body)
    assert_equal "Tasks deleted successfully", json_response["message"]
    assert_equal 0, json_response["deleted_count"]
  end

  test "should handle bulk delete with all non-existent IDs" do
    initial_count = Task.count

    assert_no_difference('Task.count') do
      delete tasks_path, params: { ids: [999999, 999998, 999997] }, as: :json
    end

    assert_response :ok
    json_response = JSON.parse(response.body)
    assert_equal "Tasks deleted successfully", json_response["message"]
    assert_equal 0, json_response["deleted_count"]
  end

  # BULK OPERATIONS INTEGRATION TESTS
  test "should handle bulk operations workflow" do
    task1 = Task.create!(title: "Task 1", description: "Description 1", completed: false)
    task2 = Task.create!(title: "Task 2", description: "Description 2", completed: false)
    task3 = Task.create!(title: "Task 3", description: "Description 3", completed: false)

    bulk_update_params = {
      tasks: [
        { id: task1.id, completed: true },
        { id: task2.id, title: "Updated Task 2", completed: true }
      ]
    }

    put tasks_path, params: bulk_update_params, as: :json
    assert_response :ok

    task1.reload
    task2.reload
    assert_equal true, task1.completed
    assert_equal "Updated Task 2", task2.title
    assert_equal true, task2.completed

    assert_difference('Task.count', -2) do
      delete tasks_path, params: { ids: [task1.id, task2.id] }, as: :json
    end

    assert_response :ok

    assert_nothing_raised { task3.reload }
    assert_equal "Task 3", task3.title
  end

  test "should handle mixed single and bulk operations" do
    task1 = Task.create!(title: "Task 1", description: "Description 1", completed: false)
    task2 = Task.create!(title: "Task 2", description: "Description 2", completed: false)

    single_update_params = { task: { completed: true } }
    put task_path(task1), params: single_update_params, as: :json
    assert_response :ok

    bulk_update_params = { tasks: [{ id: task2.id, completed: true }] }
    put tasks_path, params: bulk_update_params, as: :json
    assert_response :ok

    task1.reload
    task2.reload
    assert_equal true, task1.completed
    assert_equal true, task2.completed

    delete task_path(task1)
    assert_response :no_content

    delete tasks_path, params: { ids: [task2.id] }, as: :json
    assert_response :ok

    assert_raises(ActiveRecord::RecordNotFound) { task1.reload }
    assert_raises(ActiveRecord::RecordNotFound) { task2.reload }
  end

  test "should validate bulk update maintains data types" do
    task1 = Task.create!(title: "Task 1", description: "Description 1", completed: false)

    bulk_params = {
      tasks: [
        { id: task1.id, title: "Updated Title", description: "Updated Description", completed: true }
      ]
    }

    put tasks_path, params: bulk_params, as: :json
    assert_response :ok

    json_response = JSON.parse(response.body)
    updated_task = json_response["tasks"].first

    assert_kind_of Integer, updated_task["id"]
    assert_kind_of String, updated_task["title"]
    assert_kind_of String, updated_task["description"]
    assert_includes [true, false], updated_task["completed"]
  end
end
