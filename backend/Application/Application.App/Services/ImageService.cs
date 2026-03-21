using Application.Domain.Models;
using CSharpFunctionalExtensions;
using Microsoft.AspNetCore.Http;

namespace Application.App.Services
{
    public class ImageService
    {
        public async Task<Result<Image>> CreateImage(IFormFile titleImage, string path, string subFolder)
        {
            try
            {
                var relativeFolder = Path.Combine(subFolder, "Images");
                var fullPath = Path.Combine(path, relativeFolder);

                if (!Directory.Exists(fullPath))
                {
                    Directory.CreateDirectory(fullPath);
                }

                var extension = Path.GetExtension(titleImage.FileName);
                var uniqueName = $"{Guid.NewGuid()}{extension}";

                var filePath = Path.Combine(fullPath, uniqueName);

                await using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await titleImage.CopyToAsync(stream);
                }

                var dbPath = relativeFolder.Replace("\\", "/") + "/" + uniqueName;
                var image = Image.Create(dbPath);

                return image;
            }
            catch (Exception ex)
            {
                return Result.Failure<Image>(ex.Message);
            }
        }
    }
}
