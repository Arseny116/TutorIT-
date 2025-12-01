using Application.Domain.Interface.ITaskQuestion.ITask;
using Application.Domain.Models;
using Application.Infrastructure.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Infrastructure.Repositories
{
    public class TasksCreatorRepository : ITasksCreatorRepository
    {
        private readonly TutorITDbContext _context;

        public TasksCreatorRepository(TutorITDbContext context)
        {
            _context = context;
        }

        public async Task<List<TaskCreator>> Get(Guid CharterId)
        {
            var taskCreatorEntity = await _context.TasksCreator.Where(x=>x.ChapterID==CharterId).AsNoTracking().ToListAsync();

            var tasksCreator = new List<TaskCreator>();
            foreach (var entity in taskCreatorEntity)
            {
                var result = TaskCreator.Create(entity.Id, entity.Name, entity.Description);

                if (result.IsSuccess)
                {
                    tasksCreator.Add(result.Value);
                }
            }

            return tasksCreator;
        }

        public async Task<Guid> Create(Guid chapterId, TaskCreator taskCreator)
        {
            var taskCreatorEntity = new TaskCreatorEntity
            {
                Id = taskCreator.Id,
                Name = taskCreator.Name,
                Description = taskCreator.Description,
                ChapterID = chapterId
            };
        
            await _context.TasksCreator.AddAsync(taskCreatorEntity);
            await _context.SaveChangesAsync();

            return taskCreatorEntity.Id;
        }

        public async Task<Guid> Update(Guid id, string name, string description)
        {
            await _context.TasksCreator.Where(x => x.Id == id)
                .ExecuteUpdateAsync(s => s
                .SetProperty(n => n.Name, name)
                .SetProperty(d => d.Description, description));

            return id;
        }

        public async Task<Guid> Delete(Guid id)
        {
            await _context.TasksCreator.Where(x => x.Id == id).ExecuteDeleteAsync();

            return id;
        }
    }
}
