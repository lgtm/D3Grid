using D3Grid.Core;

namespace D3Grid.Mvc4Demo.Models
{
	public class OrderGridRowViewModel
	{
		[GridInclude(Label = "Order Id")]
		public int OrderId { get; set; }

		[GridInclude]
		public string Name { get; set; }
	}
}