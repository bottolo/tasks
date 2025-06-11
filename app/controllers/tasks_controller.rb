# = TasksController
#
# == API Endpoints:
#   GET    /tasks       # List all tasks
#   GET    /tasks/:id   # Show specific task
#   POST   /tasks       # Create new task
#   PATCH  /tasks/:id   # Update existing task (PATCH preferred)
#   PUT    /tasks/:id   # Update existing task (alternative to PATCH)
#   DELETE /tasks/:id   # Delete task
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
