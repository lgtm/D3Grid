using System;
using System.Linq;
using Xunit;

namespace D3Grid.Core.Tests
{
	public class DefaultGridDataServiceTests
	{
		[Fact]
		public void when_no_contentType_provided_throws()
		{
			IGridDataService dataService = new DefaultGridDataService();

			Assert.Throws<ArgumentException>(() => dataService.GetData(Enumerable.Empty<String>(), 1, null));
		}
	}
}
