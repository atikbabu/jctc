import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function POSPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState('Walk-in customer');
  const [otherCharges, setOtherCharges] = useState(0);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceId, setInvoiceId] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null); // This will now be a FinishedGood item
  const [quantityToAdd, setQuantityToAdd] = useState(1); // Quantity for the selected FinishedGood item

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch('/api/finished-goods', { credentials: 'include' });
    const data = await res.json();
    // Assuming data.data is an array of finished goods
    setProducts(data.data);
  };

  const filteredProducts = Array.isArray(products) ? products.filter(item => {
    const matchSearch = item.product.finishedCode.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  }) : [];

  const handleProductSelect = (item) => {
    setSelectedProduct(item); // item is now a FinishedGood object
    setQuantityToAdd(1); // Reset quantity to 1
  };

  const addToCart = () => {
    if (!selectedProduct || quantityToAdd <= 0) return;

    const existingCartItemIndex = cart.findIndex(
      (item) => item.finishedGood._id === selectedProduct._id
    );

    if (existingCartItemIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingCartItemIndex].quantity += quantityToAdd;
      setCart(updatedCart);
    } else {
      setCart(prevCart => [
        ...prevCart,
        {
          finishedGood: selectedProduct, // The entire FinishedGood object
          quantity: quantityToAdd,
          price: selectedProduct.product.price, // Use the price from the associated FinishedProduct
        },
      ]);
    }

    setSelectedProduct(null); // Clear selection after adding to cart
    setQuantityToAdd(1);
  };

  const updateCart = (finishedGoodId, field, value) => {
    setCart(
      cart.map((item) =>
        item.finishedGood._id === finishedGoodId
          ? { ...item, [field]: field === 'quantity' ? parseInt(value) : parseFloat(value) } : item
      )
    );
  };

  const incrementQuantity = (finishedGoodId) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.finishedGood._id === finishedGoodId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decrementQuantity = (finishedGoodId) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.finishedGood._id === finishedGoodId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeItem = (finishedGoodId) => {
    setCart(cart.filter((item) => !(item.finishedGood._id === finishedGoodId)));
  };

  const total = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const vat = total * 0.05;
  const grandTotal = total + vat + Number(otherCharges || 0);

  const handleSale = async () => {
    const itemsToSell = cart.map(item => ({
      finishedGoodId: item.finishedGood._id, // Send the FinishedGood _id
      quantity: item.quantity,
      price: item.price,
    }));

    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: itemsToSell,
        customerName: customer,
        total,
        vat,
        otherCharges,
        paymentMethod: 'Cash',
      }),
    });
    if (res.ok) {
      const result = await res.json();
      setInvoiceId(result._id || 'INV' + Date.now());
      setTimestamp(new Date().toLocaleString());
      setShowInvoice(true);
      fetchProducts(); // Re-fetch products to update stock
    } else {
      alert('❌ Failed to complete sale.');
    }
  };

  const resetPOS = () => {
    setCart([]);
    setOtherCharges(0);
    setCustomer('Walk-in customer');
    setInvoiceId('');
    setTimestamp('');
    setShowInvoice(false);
    setSelectedProduct(null);
    setQuantityToAdd(1);
  };

  return (
    <div className="print:!p-0 print:!bg-white">
      <div className="flex justify-between items-center bg-gray-800 text-white p-4 print:hidden">
        <div className="text-lg font-bold">JC&TC ERP</div>
        <div className="space-x-4">
          <button onClick={resetPOS} className="hover:underline">New Sale</button>
          <a href="/" className="hover:underline">Dashboard</a>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)] print:!block">
        <div className="w-1/3 border-r overflow-y-auto p-4 print:hidden">
          <div className="mb-3 space-y-2">
            <input
              type="text"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          <h2 className="text-md font-semibold mb-2">All Products</h2>
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((item) => (
              <button
                key={item._id}
                onClick={() => handleProductSelect(item)}
                className="border rounded hover:shadow-md bg-white p-2 flex flex-col items-center text-center"
              >
                {item.product.imageUrl && (
                  <img
                     src={item.product.imageUrl}
                     alt={item.product.finishedCode}
                     className="w-full h-24 object-contain mb-1"
                />
                )}
                <p className="font-medium truncate">{item.product.finishedCode} ({item.size})</p>
                <p className="text-xs text-gray-400">{item.product.category?.name} - {item.product.subCategory?.name}</p>
                <p className="text-sm text-gray-500">৳ {item.product.price} (Stock: {item.quantity})</p>
              </button>
            ))}
          </div>
        </div>

        <div className="w-2/3 p-4 overflow-y-auto">
          {!showInvoice ? (
            <>
              {selectedProduct && (
                <div className="mb-4 p-4 border rounded bg-gray-50">
                  <h3 className="text-lg font-semibold mb-2">Add {selectedProduct.product.finishedCode} ({selectedProduct.size}) to Cart</h3>
                  <div className="flex items-center mb-4">
                    <label htmlFor="quantityToAdd" className="mr-2">Quantity:</label>
                    <input
                      type="number"
                      id="quantityToAdd"
                      min="1"
                      max={selectedProduct.quantity} // Max quantity is the available stock of this FinishedGood
                      value={quantityToAdd}
                      onChange={(e) => setQuantityToAdd(Number(e.target.value))}
                      className="border p-1 rounded w-20 text-center"
                    />
                    <span className="ml-2 text-sm text-gray-600">Available: {selectedProduct.quantity}</span>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button onClick={addToCart} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      Add to Cart
                    </button>
                    <button onClick={() => setSelectedProduct(null)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <table className="w-full text-sm border-collapse mb-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Product (Size)</th>
                    <th className="border p-2">Qty</th>
                    <th className="border p-2">Price</th>
                    <th className="border p-2">Total</th>
                    <th className="border p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, index) => (
                    <tr key={`${item.finishedGood._id}-${index}`}> {/* Unique key for cart items */}
                      <td className="border p-2">{item.finishedGood.product.finishedCode} ({item.finishedGood.size})</td>
                      <td className="border p-2 flex items-center justify-center">
                        <button
                          onClick={() => decrementQuantity(item.finishedGood._id)}
                          className="bg-gray-200 text-gray-700 px-2 py-1 rounded-l hover:bg-gray-300"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateCart(item.finishedGood._id, 'quantity', e.target.value)}
                          className="w-16 border-t border-b p-1 text-center"
                        />
                        <button
                          onClick={() => incrementQuantity(item.finishedGood._id)}
                          className="bg-gray-200 text-gray-700 px-2 py-1 rounded-r hover:bg-gray-300"
                        >
                          +
                        </button>
                      </td>
                      <td className="border p-2">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateCart(item.finishedGood._id, 'price', e.target.value)}
                          className="w-20 border rounded p-1"
                        />
                      </td>
                      <td className="border p-2">৳ {(item.quantity * item.price).toFixed(2)}</td>
                      <td className="border p-2 text-center">
                        <button
                          onClick={() => removeItem(item.finishedGood._id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-right space-y-1 mb-4">
                <div>Subtotal: ৳ {total.toFixed(2)}</div>
                <div>VAT (5%): ৳ {vat.toFixed(2)}</div>
                <div>Other Charges: ৳ {Number(otherCharges).toFixed(2)}</div>
                <div className="text-xl font-bold">Total: ৳ {grandTotal.toFixed(2)}</div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="border p-2 rounded"
                >
                  <option value="Walk-in customer">Walk-in customer</option>
                </select>
                <input
                  type="number"
                  placeholder="Other Charges"
                  value={otherCharges}
                  onChange={(e) => setOtherCharges(e.target.value)}
                  className="border p-2 rounded"
                />
                <button onClick={handleSale} className="bg-green-600 text-white px-4 py-2 rounded">
                  Complete Sale
                </button>
              </div>
            </>
          ) : (
            <div className="max-w-sm mx-auto border p-4 bg-white">
              <h2 className="text-lg font-bold text-center mb-2">JC&TC ERP</h2>
              <p className="text-center text-sm">Sales Invoice</p>
              <hr className="my-2" />
              <p>Invoice ID: {invoiceId}</p>
              <p>Date: {timestamp}</p>
              <p>Customer: {customer}</p>
              <hr className="my-2" />
              {cart.map((item, index) => (
                <div key={`${item.finishedGood._id}-${index}`} className="flex justify-between text-sm">
                  <span>{item.finishedGood.product.finishedCode} ({item.finishedGood.size}) x {item.quantity}</span>
                  <span>৳ {(item.quantity * item.price).toFixed(2)}</span>
                </div>
              ))}
              <hr className="my-2" />
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>৳ {total.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span>VAT (5%)</span><span>৳ {vat.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span>Other Charges</span><span>৳ {Number(otherCharges).toFixed(2)}</span></div>
              <div className="flex justify-between text-base font-bold"><span>Total</span><span>৳ {grandTotal.toFixed(2)}</span></div>
              <div className="flex justify-center mt-4">
                <QRCodeCanvas value={invoiceId} />
              </div>
              <div className="text-center text-sm mt-2">Thanks for shopping!</div>
              <div className="text-center mt-4 print:hidden">
                <button onClick={() => window.print()} className="bg-blue-500 text-white px-4 py-1 rounded">Print</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
