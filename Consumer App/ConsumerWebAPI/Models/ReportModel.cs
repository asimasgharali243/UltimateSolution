namespace ConsumerWebAPI.Models
{
    public class BillPreview
    {
        public string? PropertyNo { get; set; }
        public int? ID { get; set; }
        public string? ConsumerName { get; set; }
        public string? ContactPerson { get; set; }

        public DateTime? StartDate { get; set; }
        public DateTime? DueDate { get; set; }
        public string? BatchMonth { get; set; }
        public int? BatchYear { get; set; }

        // 🔹 Nullable decimal fields to avoid SqlNullValueException
        public int? CurrentReadingPeak { get; set; }
        public int? UnitConsumedPeak { get; set; }
        public decimal? UnitRatePeak { get; set; }

        public int? Subsidy { get; set; }
        public int? ExtraCharges { get; set; }
        public int? Fine { get; set; }
        public int? WaterCharges { get; set; }
        public int? Extra { get; set; }
        public int? CurrentBill { get; set; }

        public int? PrevBalance { get; set; }
        public int? PrevReading { get; set; }
    }
}
