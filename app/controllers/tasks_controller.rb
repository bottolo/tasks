# = TasksController
#
# A RESTful API controller that provides complete CRUD operations for Task resources.
# This controller handles JSON requests and responses, implementing proper HTTP status
# codes and comprehensive error handling for a robust API experience.
#
# == Supported Operations:
# * Index - List all tasks
# * Show - Display a specific task by ID
# * Create - Create a new task
# * Update - Modify an existing task
# * Destroy - Delete a task
#
# == API Endpoints:
#   GET    /tasks       # List all tasks
#   GET    /tasks/:id   # Show specific task
#   POST   /tasks       # Create new task
#   PATCH  /tasks/:id   # Update existing task (PATCH preferred)
#   PUT    /tasks/:id   # Update existing task (alternative to PATCH)
#   DELETE /tasks/:id   # Delete task
#
# == Request/Response Format:
# All endpoints expect and return JSON. Content-Type should be 'application/json'.
#
# === Successful Response Examples:
#   # GET /tasks
#   Status: 200 OK
#   [
#     {
#       "id": 1,
#       "title": "Complete project",
#       "description": "Finish the Rails API project",
#       "completed": false,
#       "created_at": "2024-01-15T10:30:00.000Z",
#       "updated_at": "2024-01-15T10:30:00.000Z"
#     }
#   ]
#
#   # POST /tasks
#   Status: 201 Created
#   {
#     "id": 2,
#     "title": "New task",
#     "description": "Task description",
#     "completed": false,
#     "created_at": "2024-01-15T11:00:00.000Z",
#     "updated_at": "2024-01-15T11:00:00.000Z"
#   }
#
#   # DELETE /tasks/1
#   Status: 204 No Content
#   (empty response body)
#
# === Error Response Format:
# All error responses follow a consistent structure:
#   {
#     "error": "Human-readable error message",
#     "details": "Additional error details or validation messages"
#   }
#
# === Error Response Examples:
#   # Validation Error
#   Status: 422 Unprocessable Entity
#   {
#     "error": "Failed to create task",
#     "details": ["Title can't be blank", "Title is too short (minimum is 1 character)"]
#   }
#
#   # Not Found Error
#   Status: 404 Not Found
#   {
#     "error": "Task not found"
#   }
#
#   # Missing Parameters Error
#   Status: 400 Bad Request
#   {
#     "error": "Missing required parameters",
#     "details": "param is missing or the value is empty or invalid: task"
#   }
#
# == HTTP Status Codes:
# * 200 OK - Successful GET/PATCH requests
# * 201 Created - Successful resource creation
# * 204 No Content - Successful resource deletion
# * 400 Bad Request - Missing or invalid request parameters
# * 404 Not Found - Requested resource doesn't exist
# * 422 Unprocessable Entity - Validation failures
# * 500 Internal Server Error - Unexpected server errors
#
# == Parameters:
# === Required Parameters (POST/PATCH):
#   params: {
#     task: {
#       title: String        # Required, 1-255 characters
#       description: String  # Optional, max 1000 characters
#       completed: Boolean   # Required, true or false
#     }
#   }
#
# === URL Parameters:
#   :id - Integer, the task ID for show/update/destroy operations
#
# == Validations:
# The controller relies on the Task model for validation:
# * Title: Required, must be 1-255 characters
# * Description: Optional, maximum 1000 characters
# * Completed: Required boolean value
#
# == Error Handling Strategy:
# The controller implements comprehensive error handling:
# 1. ActiveRecord::RecordNotFound - Returns 404 for missing resources
# 2. ActionController::ParameterMissing - Returns 400 for missing params
# 3. Validation Errors - Returns 422 with detailed validation messages
# 4. StandardError - Returns 500 for unexpected server errors
#
# == Security Considerations:
# * Strong parameters using task_params to prevent mass assignment
# * All parameters are explicitly permitted (:title, :description, :completed)
# * No authentication implemented (add as needed for production use)
# * CORS headers may need configuration for browser-based clients
#
# == Usage Examples:
#   # Create a new task
#   POST /tasks
#   Content-Type: application/json
#   {
#     "task": {
#       "title": "Get a Job",
#       "description": "Try to get a job by using Rails",
#       "completed": false
#     }
#   }
#
#   # Update a task
#   PATCH /tasks/1
#   Content-Type: application/json
#   {
#     "task": {
#       "completed": true
#     }
#   }
#
#   # Partial updates are supported - only include fields to change
#

class TasksController < ApplicationController

  def index
    tasks = Task.all
    render json: tasks, status: :ok
  rescue StandardError => e
    render json: { error: 'Unable to fetch tasks', details: e.message }, status: :internal_server_error
  end

  def show
    task = Task.find(params[:id])
    render json: task, status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Task not found' }, status: :not_found
  rescue StandardError => e
    render json: { error: 'Unable to fetch task', details: e.message }, status: :internal_server_error
  end

  def create
    task = Task.new(task_params)

    if task.save
      render json: task, status: :created
    else
      render json: {
        error: 'Failed to create task',
        details: task.errors.full_messages
      }, status: :unprocessable_entity
    end
  rescue ActionController::ParameterMissing => e
    render json: { error: 'Missing required parameters', details: e.message }, status: :bad_request
  rescue StandardError => e
    render json: { error: 'Unable to create task', details: e.message }, status: :internal_server_error
  end

  def update
    task = Task.find(params[:id])

    if task.update(task_params)
      render json: task, status: :ok
    else
      render json: {
        error: 'Failed to update task',
        details: task.errors.full_messages
      }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Task not found' }, status: :not_found
  rescue ActionController::ParameterMissing => e
    render json: { error: 'Missing required parameters', details: e.message }, status: :bad_request
  rescue StandardError => e
    render json: { error: 'Unable to update task', details: e.message }, status: :internal_server_error
  end

  def destroy
    task = Task.find(params[:id])

    if task.destroy
      head :no_content
    else
      render json: {
        error: 'Failed to delete task',
        details: task.errors.full_messages
      }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Task not found' }, status: :not_found
  rescue StandardError => e
    render json: { error: 'Unable to delete task', details: e.message }, status: :internal_server_error
  end

  private

  def task_params
    params.require(:task).permit(:title, :description, :completed)
  end

end
