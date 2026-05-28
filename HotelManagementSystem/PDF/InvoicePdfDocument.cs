using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using HotelManagementSystem.DTO;

namespace HotelManagementSystem.Pdf
{
    public class InvoicePdfDocument : IDocument
    {
        private readonly InvoicesDisplayDTO _invoice;

        private static readonly string ThemePrimary = "#0F172A";   
        private static readonly string ThemeAccent = "#2563EB";   
        private static readonly string TextDark = "#1E293B";       
        private static readonly string TextMuted = "#475569";      
        private static readonly string BorderColor = "#CBD5E1";    
        private static readonly string LightBg = "#F8FAFC";        

        public InvoicePdfDocument(InvoicesDisplayDTO invoice)
        {
            _invoice = invoice;
        }

        public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(9.5f).FontFamily("Segoe UI").FontColor(TextDark));

                page.Header().Element(ComposeHeader);
                page.Content().Element(ComposeContent);
                page.Footer().Element(ComposeFooter);
            });
        }

        private void ComposeHeader(IContainer container)
        {
            container.Row(row =>
            {
                // Left Column: Brand Logo & Information
                row.RelativeItem().Column(col =>
                {
                    col.Item().Text("SERENSTAY").FontSize(22).ExtraBold().FontColor(ThemePrimary).LetterSpacing(0.08f);
                    col.Item().Text("LUXURY HOTEL & RESORTS").FontSize(7.5f).Bold().FontColor(ThemeAccent).LetterSpacing(0.2f);

                    col.Item().PaddingTop(16).Column(c =>
                    {
                        c.Spacing(2);
                        c.Item().Text("123 Serenity Blvd, Luxury District").FontSize(8.5f).FontColor(TextMuted);
                        c.Item().Text("Pune, Maharashtra - 411001").FontSize(8.5f).FontColor(TextMuted);
                        c.Item().Text("contact@serenstay.com  |  +91 20 4455 6677").FontSize(8.5f).FontColor(TextMuted);
                    });
                });

                // Right Column: TAX INVOICE Meta
                row.ConstantItem(180).Column(col =>
                {
                    col.Item().AlignRight().Text("INVOICE").FontSize(22).ExtraBold().FontColor(ThemePrimary);
                    
                    // Styled Status Badge
                    col.Item().PaddingTop(6).AlignRight().Row(r =>
                    {
                        var isPaid = _invoice.PaymentStatus?.ToLower() == "paid";
                        var badgeBg = isPaid ? "#ECFDF5" : "#FEF2F2"; 
                        var badgeText = isPaid ? "#065F46" : "#991B1B"; 
                        var statusString = _invoice.PaymentStatus?.ToUpper() ?? "UNPAID";
                        
                        r.ConstantItem(100)
                            .Background(badgeBg)
                            .Border(0.5f)
                            .BorderColor(isPaid ? "#A7F3D0" : "#FEE2E2")
                            .PaddingVertical(4)
                            .PaddingHorizontal(8)
                            .AlignCenter()
                            .Text(statusString)
                            .FontSize(8)
                            .ExtraBold()
                            .FontColor(badgeText)
                            .LetterSpacing(0.08f);
                    });

                    col.Item().PaddingTop(20).Column(c =>
                    {
                        c.Item().BorderBottom(0.5f).BorderColor(BorderColor).PaddingVertical(3).Row(r =>
                        {
                            r.RelativeItem().Text("Invoice ID:").FontSize(8.5f).FontColor(TextMuted);
                            r.RelativeItem().AlignRight().Text($"{_invoice.InvoiceId}").FontSize(8.5f).Bold().FontColor(TextDark);
                        });

                        c.Item().BorderBottom(0.5f).BorderColor(BorderColor).PaddingVertical(3).Row(r =>
                        {
                            r.RelativeItem().Text("Booking Ref:").FontSize(8.5f).FontColor(TextMuted);
                            r.RelativeItem().AlignRight().Text($"{_invoice.BookingId}").FontSize(8.5f).Bold().FontColor(TextDark);
                        });

                        c.Item().PaddingVertical(3).Row(r =>
                        {
                            r.RelativeItem().Text("Invoice Date:").FontSize(8.5f).FontColor(TextMuted);
                            var dateStr = _invoice.InvoiceDate.HasValue ? _invoice.InvoiceDate.Value.ToString("dd MMM yyyy") : System.DateTime.Now.ToString("dd MMM yyyy");
                            r.RelativeItem().AlignRight().Text(dateStr).FontSize(8.5f).Bold().FontColor(TextDark);
                        });
                    });
                });
            });
        }

        private void ComposeContent(IContainer container)
        {
            container.PaddingVertical(20).Column(col =>
            {
                // Customer & Stay Summary Section
                col.Item().Border(0.5f).BorderColor(BorderColor).Background(LightBg).Padding(16).Row(row =>
                {
                    // Guest Bill-To info
                    row.RelativeItem().Column(c =>
                    {
                        c.Spacing(3);
                        c.Item().Text("GUEST DETAILS").FontSize(7.5f).Bold().FontColor(ThemeAccent).LetterSpacing(0.1f);
                        c.Item().Text(_invoice.GuestName ?? "Valued Guest").FontSize(12).ExtraBold().FontColor(ThemePrimary);
                        
                        var roomNum = _invoice.Room != null ? _invoice.Room.RoomNumber.ToString() : "N/A";
                        c.Item().Text($"Room: {roomNum}").FontSize(9).FontColor(TextMuted);
                    });

                    // Separator line
                    row.ConstantItem(1).PaddingVertical(4).Background(BorderColor);

                    // Stay Metadata info
                    row.RelativeItem().PaddingLeft(20).Column(c =>
                    {
                        c.Spacing(3);
                        c.Item().Text("STAY SUMMARY").FontSize(7.5f).Bold().FontColor(ThemeAccent).LetterSpacing(0.1f);
                        c.Item().Text($"{_invoice.Nights} Night(s)").FontSize(11).ExtraBold().FontColor(ThemePrimary);
                        
                        var checkoutStr = _invoice.CheckOutDate.HasValue ? _invoice.CheckOutDate.Value.ToString("dd MMM yyyy") : "Completed";
                        c.Item().Text($"Check-Out Date: {checkoutStr}").FontSize(9).FontColor(TextMuted);
                    });
                });

                // Line Items Grid (Fully bordered table - clean and realistic)
                col.Item().PaddingTop(24).Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.ConstantColumn(30);         // Index
                        columns.RelativeColumn(5);          // Description
                        columns.RelativeColumn(2);          // Unit Price
                        columns.RelativeColumn(1.5f);        // Qty
                        columns.RelativeColumn(2);          // Net Amount
                    });

                    // Header Row with modern slate background & clean borders
                    table.Header(header =>
                    {
                        header.Cell().Element(HeaderStyle).Text("#").FontColor(Colors.White);
                        header.Cell().Element(HeaderStyle).Text("Description / Service").FontColor(Colors.White);
                        header.Cell().Element(HeaderStyle).AlignRight().Text("Unit Price").FontColor(Colors.White);
                        header.Cell().Element(HeaderStyle).AlignCenter().Text("Qty/Nights").FontColor(Colors.White);
                        header.Cell().Element(HeaderStyle).AlignRight().Text("Total").FontColor(Colors.White);

                        static IContainer HeaderStyle(IContainer container) => 
                            container.Background(ThemePrimary)
                                     .Border(0.5f)
                                     .BorderColor(BorderColor)
                                     .PaddingVertical(8)
                                     .PaddingHorizontal(8)
                                     .DefaultTextStyle(x => x.Bold().FontSize(8.5f));
                    });

                    // Row 1: Accommodation Charge
                    var roomPrice = _invoice.Room != null ? _invoice.Room.PricePerNight : 0m;
                    var roomNo = _invoice.Room != null ? _invoice.Room.RoomNumber.ToString() : "N/A";
                    
                    table.Cell().Element(CellContent).Text("1").FontSize(8.5f);
                    table.Cell().Element(CellContent).Text($"Accommodation: Room {roomNo}").FontSize(8.5f).Bold().FontColor(TextDark);
                    table.Cell().Element(CellContent).AlignRight().Text($"{roomPrice:N2}").FontSize(8.5f);
                    table.Cell().Element(CellContent).AlignCenter().Text(_invoice.Nights.ToString()).FontSize(8.5f);
                    table.Cell().Element(CellContent).AlignRight().Text($"{_invoice.RoomCharges:N2}").FontSize(8.5f).Bold().FontColor(TextDark);

                    // Row 2+: Services
                    int serviceIndex = 2;
                    if (_invoice.Services != null && _invoice.Services.Count > 0)
                    {
                        foreach (var service in _invoice.Services)
                        {
                            table.Cell().Element(CellContent).Text(serviceIndex++.ToString()).FontSize(8.5f);
                            table.Cell().Element(CellContent).Text(service.ServiceName ?? "Hotel Service Usage").FontSize(8.5f).FontColor(TextDark);
                            table.Cell().Element(CellContent).AlignRight().Text($"{service.ServicePrice:N2}").FontSize(8.5f);
                            table.Cell().Element(CellContent).AlignCenter().Text("1").FontSize(8.5f);
                            table.Cell().Element(CellContent).AlignRight().Text($"{service.ServicePrice:N2}").FontSize(8.5f).Bold().FontColor(TextDark);
                        }
                    }

                    static IContainer CellContent(IContainer container) => 
                        container.Border(0.5f)
                                 .BorderColor(BorderColor)
                                 .PaddingVertical(8)
                                 .PaddingHorizontal(8);
                });

                // Financial Summary Area
                col.Item().PaddingTop(20).Row(row =>
                {
                    // Left Column: Payment & Transaction Details
                    row.RelativeItem().Column(c =>
                    {
                        c.Spacing(6);
                        
                        c.Item().Column(pay =>
                        {
                            pay.Spacing(2);
                            pay.Item().Text("PAYMENT METHOD").FontSize(7.5f).Bold().FontColor(ThemeAccent).LetterSpacing(0.12f);
                            pay.Item().Text(_invoice.PaymentMethod ?? "Cash / Card").FontSize(9).Bold().FontColor(TextDark);
                        });
                        
                        c.Item().Column(tx =>
                        {
                            tx.Spacing(2);
                            tx.Item().Text("TRANSACTION SUMMARY").FontSize(7.5f).Bold().FontColor(ThemeAccent).LetterSpacing(0.12f);
                            tx.Item().Text($"Amount Paid: ₹{_invoice.PaidAmount:N2}").FontSize(8.5f).FontColor(TextMuted);
                            
                            var isDue = _invoice.BalanceAmount > 0;
                            var dueColor = isDue ? "#B91C1C" : "#0F172A";
                            var dueText = isDue ? $"Outstanding Balance Due: ₹{_invoice.BalanceAmount:N2}" : "Invoice Fully Settled";
                            tx.Item().Text(dueText).FontSize(8.5f).Bold().FontColor(dueColor);
                        });
                    });

                    // Right Column: Calculations
                    row.ConstantItem(220).Column(c =>
                    {
                        c.Spacing(5);
                        
                        var subtotal = _invoice.RoomCharges + _invoice.ServiceCharges;
                        
                        c.Item().Row(r => {
                            r.RelativeItem().Text("Subtotal:").FontSize(8.5f).FontColor(TextMuted);
                            r.RelativeItem().AlignRight().Text($"{subtotal:N2}").FontSize(8.5f).FontColor(TextDark);
                        });
                        
                        c.Item().Row(r => {
                            r.RelativeItem().Text("Tax (12%):").FontSize(8.5f).FontColor(TextMuted);
                            r.RelativeItem().AlignRight().Text($"{_invoice.TaxAmount:N2}").FontSize(8.5f).FontColor(TextDark);
                        });
                        
                        c.Item().PaddingVertical(2).LineHorizontal(0.5f).LineColor(BorderColor);
                        
                        c.Item().Row(r => {
                            r.RelativeItem().Text("GRAND TOTAL").ExtraBold().FontSize(12).FontColor(ThemeAccent).LetterSpacing(0.04f);
                            r.RelativeItem().AlignRight().Text($"INR {_invoice.TotalAmount:N2}").ExtraBold().FontSize(12).FontColor(ThemeAccent).LetterSpacing(0.04f);
                        });
                    });
                });
            });
        }

        private void ComposeFooter(IContainer container)
        {
            container.Column(col => 
            {
                col.Item().PaddingBottom(8).LineHorizontal(0.5f).LineColor(BorderColor);
                
                col.Item().Row(row => 
                {
                    // Left Column: Terms & Conditions
                    row.RelativeItem().Column(c => 
                    {
                        c.Spacing(2);
                        c.Item().Text("TERMS & CONDITIONS").FontSize(7).Bold().FontColor(TextDark).LetterSpacing(0.05f);
                        c.Item().Text("1. This is a system-generated electronic invoice representing guest stays.").FontSize(6.5f).FontColor(TextMuted);
                        c.Item().Text("2. All disputes are subject to local jurisdiction.").FontSize(6.5f).FontColor(TextMuted);
                    });

                    // Right Column: Authorized Signatory
                    row.RelativeItem().AlignRight().Column(c => 
                    {
                        c.Item().Text("Authorized Signatory").FontSize(8).SemiBold().FontColor(TextDark);
                        c.Item().PaddingTop(12).Text("_______________________").FontColor(Colors.Grey.Lighten1);
                        c.Item().PaddingTop(2).Text("SerenStay Reception Manager").FontSize(7).FontColor(TextMuted);
                    });
                });
                
                // Centered Greeting
                col.Item().AlignCenter().PaddingTop(12).Text(x => 
                {
                    x.Span("Thank you for staying at SerenStay. We hope to welcome you back soon!").Italic().FontSize(8).FontColor(ThemeAccent);
                });
            });
        }
    }
}