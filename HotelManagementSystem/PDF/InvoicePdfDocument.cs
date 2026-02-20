using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using HotelManagementSystem.DTO;

namespace HotelManagementSystem.Pdf
{
    public class InvoicePdfDocument : IDocument
    {
        private readonly InvoicesDisplayDTO _invoice;

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
                page.Margin(35);
                page.DefaultTextStyle(x => x.FontSize(11));

                // Header
                page.Header().Column(col =>
                {
                    col.Item().Text("Swagatam Hotel")
                        .FontSize(20)
                        .Bold()
                        .AlignCenter();

                    col.Item().PaddingTop(10).LineHorizontal(1);
                });

                // Content
                page.Content().PaddingVertical(10).Column(col =>
                {
                    col.Spacing(15);

                    // + Invoice & Guest Info 
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text($"Invoice ID: {_invoice.InvoiceId}").Bold();
                            c.Item().Text($"Invoice Date: {_invoice.InvoiceDate:dd-MM-yyyy}");
                        });

                        row.RelativeItem().AlignRight().Column(c =>
                        {
                            c.Item().Text("BILL TO").Bold();
                            c.Item().Text(_invoice.GuestName);
                        });
                    });

                    col.Item().LineHorizontal(1);

                    // Room Details 
                    col.Item().Text("Room Details").Bold().FontSize(13);

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.ConstantColumn(100);
                        });

                        table.Header(h =>
                        {
                            h.Cell().Element(CellHeader).Text("Description");
                            h.Cell().Element(CellHeader).AlignRight().Text("Amount");
                        });

                        table.Cell().Text($"Room No: {_invoice.Room.RoomNumber}");
                        table.Cell().AlignRight().Text(
                            (_invoice.Room.PricePerNight * _invoice.Nights).ToString("0.00"));

                        table.Cell().Text($"Price / Night × {_invoice.Nights} nights");
                        table.Cell().AlignRight().Text(_invoice.RoomCharges.ToString("0.00"));
                    });

                    // Services 
                    if (_invoice.Services.Any())
                    {
                        col.Item().PaddingTop(10).Text("Services").Bold().FontSize(13);

                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn();
                                columns.ConstantColumn(100);
                            });

                            table.Header(h =>
                            {
                                h.Cell().Element(CellHeader).Text("Service");
                                h.Cell().Element(CellHeader).AlignRight().Text("Price");
                            });

                            foreach (var service in _invoice.Services)
                            {
                                table.Cell().Text(service.ServiceName);
                                table.Cell().AlignRight()
                                    .Text(service.ServicePrice.ToString("0.00"));
                            }
                        });
                    }

                    col.Item().LineHorizontal(1);

                    // Summary 
                    col.Item().AlignRight().Column(c =>
                    {
                        c.Item().Row(r =>
                        {
                            r.RelativeItem().Text("Room Charges:");
                            r.ConstantItem(100).AlignRight()
                                .Text(_invoice.RoomCharges.ToString("0.00"));
                        });

                        c.Item().Row(r =>
                        {
                            r.RelativeItem().Text("Service Charges:");
                            r.ConstantItem(100).AlignRight()
                                .Text(_invoice.ServiceCharges.ToString("0.00"));
                        });

                        c.Item().Row(r =>
                        {
                            r.RelativeItem().Text("Tax (12%):");
                            r.ConstantItem(100).AlignRight()
                                .Text(_invoice.TaxAmount.ToString("0.00"));
                        });

                        c.Item().PaddingTop(5).LineHorizontal(1);

                        c.Item().Row(r =>
                        {
                            r.RelativeItem().Text("TOTAL")
                                .Bold()
                                .FontSize(13);
                            r.ConstantItem(100).AlignRight()
                                .Text(_invoice.TotalAmount.ToString("0.00"))
                                .Bold()
                                .FontSize(13);
                        });
                    });
                });

                //  Footer 
                page.Footer().AlignCenter().Column(col =>
                {
                    col.Item().LineHorizontal(1);
                    col.Item().Text("Thank you for choosing our hotel!")
                        .SemiBold();
                    col.Item().Text("We look forward to serving you again.");
                });
            });
        }

        // Helpers 
        private static IContainer CellHeader(IContainer container)
        {
            return container
                .Background(Colors.Grey.Lighten3)
                .Padding(5)
                .DefaultTextStyle(x => x.Bold());
        }
    }
}
