using System;
using System.Linq;
using NUnit.Framework;

namespace D3Grid.Core.Tests
{
	[TestFixture]
	public class DefaultGridDataServiceTests
	{
		[Test]
		public void when_no_contentType_provided_throws()
		{
			IGridDataService dataService = new DefaultGridDataService();

			Assert.Throws<ArgumentException>(() => dataService.GetData(Enumerable.Empty<String>(), 1, null));
		}
	}
}
