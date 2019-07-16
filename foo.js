let rentals = [
    {
      "returnDate": "2019-03-01T03:00:00.000Z",
      "inventory_id": 1
    },
    {
      "returnDate": "2019-03-01T03:00:00.000Z",
      "inventory_id": 1
    },
    {
      "returnDate": "2019-03-01T03:00:00.000Z",
      "inventory_id": 1
    }
  ]

  console.log(
      rentals.some(r => r.returnDate < new Date())
  )