using FluentValidation;
using HotelManagementSystem.DTO;

namespace HotelManagementSystem.Validators
{
    public class ServicesCreateValidator : AbstractValidator<ServicesDTO>
    {
        public ServicesCreateValidator() 
        { 
            RuleFor(x => x.ServiceName)
                .NotEmpty().WithMessage("ServiceName is required.")
                .MaximumLength(50).WithMessage("ServiceName cannot exceed 50 characters.");
           
            RuleFor(x => x.ServicePrice)
                .NotNull().WithMessage("Price is required.")
                .GreaterThan(0).WithMessage("Price must be greater than 0.");
        }
    }
}
