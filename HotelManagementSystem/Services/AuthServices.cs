using HotelManagementSystem.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

public class AuthService : IAuthService
{
    private readonly HotelManagementSystemContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(HotelManagementSystemContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public string GenerateJwtToken(Staff staff)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var keyString = jwtSettings["Key"];

        // 1. Validation: Ensure the key exists and is long enough (32+ chars for HS256)
        if (string.IsNullOrEmpty(keyString) || keyString.Length < 32)
        {
            throw new InvalidOperationException("JWT Secret Key is missing or too short. It must be at least 32 characters.");
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // 2. Claims Mapping
        var claims = new[]
        {
        new Claim(JwtRegisteredClaimNames.Sub, staff.Username),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // Unique ID for the token
        new Claim("FullName", staff.FullName),
        new Claim("Role", staff.Role),
        new Claim("StaffId", staff.StaffId.ToString())
    };

        // 3. Expiry Logic
        var expiryMinutes = Convert.ToDouble(jwtSettings["TokenExpiryMinutes"] ?? "60");

        // 
        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes), // Use UtcNow for global compatibility
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<object> LoginAsync(string username, string password)
    {
        // Important: In production, use password hashing (e.g., BCrypt)
        var staff = await _context.Staffs
            .FirstOrDefaultAsync(s => s.Username == username && s.Password == password);

        if (staff == null) return null;

        var token = GenerateJwtToken(staff);

        return new
        {
            token,
            user = new
            {
                staff.StaffId,
                staff.Username,
                staff.FullName,
                staff.Role
            }
        };
    }
}