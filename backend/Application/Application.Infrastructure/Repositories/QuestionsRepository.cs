using Application.Domain.Interface.ITaskQuestion.IQuestion;
using Application.Domain.Models;
using Application.Infrastructure.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Infrastructure.Repositories
{
    public class QuestionsRepository : IQuestionsRepository
    {
        private readonly TutorITDbContext _context;

        public QuestionsRepository(TutorITDbContext context)
        {
            _context = context;
        }

        public async Task<List<Question>> Get()
        {
            var questionEntity = await _context.Questions.AsNoTracking().ToListAsync();

            var questions = new List<Question>();
            foreach (var entity in questionEntity)
            {
                var result = Question.Create(entity.Id, entity.Name, entity.Answer);

                if (result.IsSuccess)
                {
                    questions.Add(result.Value);
                }
            }

            return questions;
        }

        public async Task<Guid> Create(Guid taskCreatorId, Question question)
        {
            var questonEntity = new QuestionEntity
            {
                Id = question.Id,
                Name = question.Name,
                Answer = question.Answer,
                TaskCreatorId = taskCreatorId,
            };

            await _context.Questions.AddAsync(questonEntity);
            await _context.SaveChangesAsync();

            return question.Id;
        }

        public async Task<Guid> Update(Guid id, string name, bool answer)
        {
            await _context.Questions.Where(x => x.Id == id)
                .ExecuteUpdateAsync(s => s
                .SetProperty(n => n.Name, n => name)
                .SetProperty(a => a.Answer, a => answer));

            return id;
        }

        public async Task<Guid> Delete(Guid id)
        {
            await _context.Questions.Where(q => q.Id == id).ExecuteDeleteAsync();

            return id;
        }
    }
}
