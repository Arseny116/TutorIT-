using Application.Domain.Models;
using CSharpFunctionalExtensions;
using Microsoft.AspNetCore.Http;

namespace Application.App.Services
{
    public class ImageService
    {
        public async Task<Result<Image>> CreateImage(IFormFile titleImage, string path)
        {
            try
            {
                if (!Directory.Exists(path))
                {
                    Directory.CreateDirectory(path);
                }   

                var filename = Path.GetFileName(titleImage.FileName);
                var filePath = Path.Combine(path, filename);

                await using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await titleImage.CopyToAsync(stream);
                }

                var image = Image.Create(filePath);

                return image;
            }
            catch (Exception ex)
            {
                return Result.Failure<Image>(ex.Message);
            }
        }
    }
}
