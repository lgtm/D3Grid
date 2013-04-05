using System;
using System.Collections.Generic;
using System.Web.Mvc;
using D3Grid.Core;
using D3Grid.Mvc;
using D3Grid.Mvc4Demo.Models;

namespace D3Grid.Mvc4Demo.Controllers
{
	public class HomeController : Controller
	{
		public ActionResult Index()
		{
			return View();
		}

		public ActionResult OrdersJson(GridRequestModel request)
		{
			var viewModels = new List<OrderGridRowViewModel>();

			var numToSkip = request.PageSize*request.PageIndex;
			var numToReturn = request.PageSize*(request.PageIndex + 1);

			for (int i = numToSkip; i < numToReturn; i++)
			{
				viewModels.Add(new OrderGridRowViewModel()
				{
					OrderId = i,
					Name = "Order " + i,
				});
			}

			return this.GridRows(viewModels, 100, "This is a footer note about this data.");
		}
	}
}
