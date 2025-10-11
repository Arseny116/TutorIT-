using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Domain.Models.RootCodeProblem;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Application.Infrastructure.Repositories
{
    public class CodeProblemRep
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

        public async Task<CodeProblem> Create(string Title,string Description, string Difficulty)
        {
            
        }

    }
}
