using PMS.API.DTOs.Auth;

namespace PMS.API.Services.Interfaces;

public interface IAuthService
{
    Task<TokenDto?> LoginAsync(LoginDto dto);
    Task<AppUserDto> CreateUserAsync(CreateUserDto dto);
    Task<List<AppUserDto>> GetAllUsersAsync();
    Task DeleteUserAsync(int id);
}
