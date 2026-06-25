using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PMS.API.Data;
using PMS.API.DTOs.Auth;
using PMS.API.Exceptions;
using PMS.API.Models;
using PMS.API.Services.Interfaces;

namespace PMS.API.Services;

public class AuthService(AppDbContext db, IConfiguration config) : IAuthService
{
    private readonly PasswordHasher<AppUser> _hasher = new();

    public async Task<TokenDto?> LoginAsync(LoginDto dto)
    {
        var user = await db.AppUsers.FirstOrDefaultAsync(u => u.Username == dto.Username);
        if (user is null) return null;

        var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
        if (result == PasswordVerificationResult.Failed) return null;

        return new TokenDto
        {
            Token = GenerateToken(user),
            Username = user.Username,
            Role = user.Role.ToString()
        };
    }

    public async Task<AppUserDto> CreateUserAsync(CreateUserDto dto)
    {
        if (await db.AppUsers.AnyAsync(u => u.Username == dto.Username))
            throw new ConflictException($"Username '{dto.Username}' is already taken.");

        if (!Enum.TryParse<UserRole>(dto.Role, true, out var role))
            role = UserRole.User;

        var user = new AppUser { Username = dto.Username, Role = role };
        user.PasswordHash = _hasher.HashPassword(user, dto.Password);

        db.AppUsers.Add(user);
        await db.SaveChangesAsync();
        return ToDto(user);
    }

    public async Task<List<AppUserDto>> GetAllUsersAsync() =>
        await db.AppUsers.OrderBy(u => u.Username).Select(u => ToDto(u)).ToListAsync();

    public async Task DeleteUserAsync(int id)
    {
        var user = await db.AppUsers.FindAsync(id)
            ?? throw new NotFoundException("User", id);
        db.AppUsers.Remove(user);
        await db.SaveChangesAsync();
    }

    private string GenerateToken(AppUser user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };
        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static AppUserDto ToDto(AppUser u) => new()
    {
        Id = u.Id,
        Username = u.Username,
        Role = u.Role.ToString(),
        CreatedAt = u.CreatedAt
    };
}
