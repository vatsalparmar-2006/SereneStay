using FluentValidation;
using HotelManagementSystem.DTO;

namespace HotelManagementSystem.Validators
{
    public class StaffCreateValidator : AbstractValidator<StaffCreateDTO>
    {
        public StaffCreateValidator()
        {
            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("Username or Email is required")
                .MinimumLength(4).WithMessage("Entry must be at least 4 characters long")
                .MaximumLength(50).WithMessage("Entry must not exceed 50 characters") 
                .Matches(@"^[a-zA-Z0-9][a-zA-Z0-9._@]*[a-zA-Z0-9]$")
                .WithMessage("Username/Email must start and end with a letter or number, and can contain dots, underscores, or the @ symbol.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(6).WithMessage("Password must be at least 6 characters")
                .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter")
                .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter")
                .Matches("[0-9]").WithMessage("Password must contain at least one number");

            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required")
                .MinimumLength(3).WithMessage("Full name must be at least 3 characters")
                .MaximumLength(50).WithMessage("Full name must not exceed 50 characters")
                .Matches("^[a-zA-Z ]+$").WithMessage("Full name can contain only letters and spaces");

            RuleFor(x => x.Role)
                .NotEmpty().WithMessage("Role is required")
                .Must(role => new[] { "Admin", "Manager", "Receptionist" }.Contains(role))
                .WithMessage("Role must be Admin, Manager, or Receptionist");
        }
    }
}
