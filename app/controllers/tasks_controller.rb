class TasksController < ApplicationController

  # GET /tasks
  def index

    render json: Task.all

  end

  # GET /tasks/:id
  def show
    task = Task.find(params[:id])
    render json: task
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Task not found' }, status: :not_found
  end

  # POST /tasks
  def create

    task = Task.new(task_params)

    if task.save

      render json: task

    else

      render json: { error: 'Failed to create task' }, status: :unprocessable_entity

    end

  end

  # PATCH/PUT /tasks/:id
  def update
    task = Task.find(params[:id])

    if task.update(task_params)
      render json: task
    else
      render json: { error: 'Failed to update task' }, status: :unprocessable_entity
    end

  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Task not found' }, status: :not_found
  end

  def destroy
    task = Task.find(params[:id])
    task.destroy
    head :no_content
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Task not found' }, status: :not_found
  end

  private

  def task_params

    params.require(:task).permit(:title, :completed)

  end

end
