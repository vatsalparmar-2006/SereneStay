using FluentValidation;
using HotelManagementSystem.DTO;
using HotelManagementSystem.Helper;

namespace HotelManagementSystem.Validators
{
    public class GuestCreateValidator : AbstractValidator<GuestCreateDTO>
    {
        public GuestCreateValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("FullName is required.")
                .MaximumLength(100).WithMessage("FullName cannot exceed 100 characters.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Email must be a valid email address.")
                .MaximumLength(50).WithMessage("Email cannot exceed 50 characters.");

            RuleFor(x => x.Phone)
                .NotEmpty().WithMessage("PhoneNumber is required.")
                .Matches(@"^\+?[1-9]\d{10,14}$").WithMessage("PhoneNumber must be a valid phone number.")
                .MaximumLength(15).WithMessage("PhoneNumber cannot exceed 15 characters.");

            RuleFor(x => x.Address)
                .NotEmpty().WithMessage("Address is required.")
                .MaximumLength(200).WithMessage("Address cannot exceed 200 characters.");

            RuleFor(x => x.IdproofType)
                .NotEmpty().WithMessage("IdproofType is required.");

            //RuleFor(x => x.IdproofNumber)
            //    .NotEmpty().WithMessage("IdproofNumber is required.")
            //    .MaximumLength(20).WithMessage("IdproofNumber cannot exceed 20 characters.");

            RuleFor(x => x.IdproofNumber)
                .NotEmpty().WithMessage("IdproofNumber is required.")
                .DependentRules(() => {
                    // Validation for Aadhaar (Fix 12 digits)
                    RuleFor(x => x.IdproofNumber)
                        .Must((guest, idNumber) => {
                            if (guest.IdproofType == "Aadhaar")
                            {
                                string cleanId = idNumber.Replace(" ", "").Replace("-", "");
                                return Verhoeff.Validate(cleanId);
                            }
                            return true;
                        }).WithMessage("Invalid Aadhaar number (It's a fake Aadhar ID.).");

                    // Validation for PAN (Fix 10 alphanumeric)
                    RuleFor(x => x.IdproofNumber)
                        .Length(10).WithMessage("PAN must be exactly 10 characters.")
                        .Matches(@"^[A-Z]{5}[0-9]{4}[A-Z]{1}$").WithMessage("Invalid PAN format (e.g., ABCDE1234F).")
                        .When(x => x.IdproofType == "PAN");

                    // Default catch-all for others
                    RuleFor(x => x.IdproofNumber)
                        .MaximumLength(20).WithMessage("ID number cannot exceed 20 characters.")
                        .When(x => x.IdproofType != "Aadhaar" && x.IdproofType != "PAN");
                });
        }
    }
}
