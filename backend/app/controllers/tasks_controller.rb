# = TasksController
#
# == API Endpoints:
#   GET    /tasks       # List all tasks (with optional filtering)
#   GET    /tasks/:id   # Show specific task
#   POST   /tasks       # Create new task
#   PUT    /tasks       # Bulk update multiple tasks
#   DELETE /tasks       # Bulk delete multiple tasks
#   PATCH  /tasks/:id   # Update existing task (PATCH preferred)
#   PUT    /tasks/:id   # Update existing task (alternative to PATCH)
#   DELETE /tasks/:id   # Delete task
#
# == Parameters:
# === Required Parameters (POST/PATCH/PUT):
#   params: {
#     task: {
#       title: String        # Required, 1-255 characters
#       description: String  # Optional, max 1000 characters
#       completed: Boolean   # Required, true or false
#     }
#   }
#
# === Bulk Update Parameters (PUT /tasks):
#   params: {
#     tasks: [
#       { id: Integer, title: String, description: String, completed: Boolean },
#       { id: Integer, completed: Boolean }  # Partial updates allowed
#     ]
#   }
#
# === Bulk Delete Parameters (DELETE /tasks):
#   params: {
#     ids: [Integer, Integer, ...]  # Array of task IDs to delete
#   }
#
# === URL Parameters:
#   :id - Integer, the task ID for show/update/destroy operations
#
# === Query Parameters (GET /tasks):
#   completed: Boolean   # Filter by completion status (true/false)
#   search: String       # Search tasks by title (case-insensitive)
#
# == Usage Examples:
#   # Bulk update multiple tasks
#   PUT /tasks
#   {
#     "tasks": [
#       { "id": 1, "completed": true },
#       { "id": 2, "title": "Updated title", "completed": false }
#     ]
#   }
#
#   # Bulk delete multiple tasks
#   DELETE /tasks
#   {
#     "ids": [1, 2, 3, 4]
#   }
#

class TasksController < ApplicationController

  def index
    tasks = Task.all

    if params[:completed].present?
      completed_value = ActiveModel::Type::Boolean.new.cast(params[:completed])
      tasks = tasks.where(completed: completed_value)
    end

    if params[:search].present?
      search_term = "%#{params[:search].downcase}%"
      tasks = tasks.where("LOWER(title) LIKE ?", search_term)
    end

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
    if params[:id].blank?
      return bulk_update_tasks
    end

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
    if params[:id].blank?
      return bulk_destroy_tasks
    end

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

  def bulk_update_tasks
    unless params.has_key?(:tasks)
      return render json: { error: 'Missing required parameters', details: 'param is missing or the value is empty or invalid: tasks' }, status: :bad_request
    end

    tasks_params = params[:tasks] || []
    updated_tasks = []
    errors = []

    Task.transaction do
      tasks_params.each do |task_data|
        task = Task.find(task_data[:id])
        if task.update(task_data.except(:id).permit(:title, :description, :completed))
          updated_tasks << task
        else
          errors << { id: task.id, errors: task.errors.full_messages }
        end
      end

      if errors.any?
        raise ActiveRecord::Rollback
      end
    end

    if errors.any?
      render json: { error: 'Failed to update some tasks', details: errors }, status: :unprocessable_entity
    else
      render json: { message: 'Tasks updated successfully', tasks: updated_tasks }, status: :ok
    end
  rescue ActiveRecord::RecordNotFound => e
    render json: { error: 'One or more tasks not found' }, status: :not_found
  rescue StandardError => e
    render json: { error: 'Unable to update tasks', details: e.message }, status: :internal_server_error
  end

  def bulk_destroy_tasks
    unless params.has_key?(:ids)
      return render json: { error: 'Missing required parameters', details: 'param is missing or the value is empty or invalid: ids' }, status: :bad_request
    end

    ids = params[:ids] || []
    deleted_count = Task.where(id: ids).destroy_all.count

    render json: {
      message: 'Tasks deleted successfully',
      deleted_count: deleted_count
    }, status: :ok
  rescue StandardError => e
    render json: { error: 'Unable to delete tasks', details: e.message }, status: :internal_server_error
  end

  def task_params
    params.require(:task).permit(:title, :description, :completed)
  end

end
