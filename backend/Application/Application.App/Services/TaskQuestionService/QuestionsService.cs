using Application.Domain.Interface.ITaskQuestion.IQuestion;
using Application.Domain.Models.TaskQuestion;

namespace Application.App.Services.TaskQuestionService
{
    public class QuestionsService : IQuestionsService
    {
        private readonly IQuestionsRepository _questionsRepository;

        public QuestionsService(IQuestionsRepository questionsRepository)
        {
            _questionsRepository = questionsRepository;
        }

        public async Task<List<Question>> GetQuestions()
        {
            return await _questionsRepository.Get();
        }

        public async Task<Guid> CreateQuestion(Question question)
        {
            return await _questionsRepository.Create(question);
        }

        public async Task<Guid> UpdateQuestion(Guid id, string name, bool answer)
        {
            return await _questionsRepository.Update(id, name, answer);
        }

        public async Task<Guid> DeleteQuestion(Guid id)
        {
            return await _questionsRepository.Delete(id);
        }
    }
}
