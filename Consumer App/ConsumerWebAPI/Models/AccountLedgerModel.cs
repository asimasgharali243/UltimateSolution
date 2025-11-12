// Model for Account Ledger
public class AccountLedger
{
    public int ID { get; set; }
    public string Type { get; set; }
    public DateTime Date { get; set; }
    public int Voucher_No { get; set; }
    public string Descriptions { get; set; }
    public int AccountNo { get; set; }
    public int Debit { get; set; }
    public int Credit { get; set; }
    public int UserID { get; set; }
    public string ConsumerName { get; set; }
    public string PropertyNo { get; set; }
    public string openingBalance { get; set; }
}
