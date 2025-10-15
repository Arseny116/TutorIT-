using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Domain.Models.RootCodeProblem;
using Application.Infrastructure.Entities.EntityExecutorCode;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Application.Infrastructure.Repositories
{
    public class CodeProblemRep : ICodeProblemRep
    {
        private readonly TutorITDbContext _context;
        private readonly IMapper _mapper;

        public CodeProblemRep(TutorITDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }


        public async Task<CodeProblem> GetById(Guid Id)
        {
            var CodeProblementity = await _context.CodeProblemEntity
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == Id);
            return _mapper.Map<CodeProblem>(CodeProblementity);
        }

        public async Task Create(string title, string description, string difficulty)
        {
            _context.CodeProblemEntity.Add(new CodeProblemEntity { Id = Guid.NewGuid(), Title = title, Description = description, Difficulty = difficulty });
            await _context.SaveChangesAsync();
        }



    }
}
