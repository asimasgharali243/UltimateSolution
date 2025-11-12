import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Check,
  Scan,
  ChevronDown,
  RefreshCw,
  ChevronsUpDown,
  Save,
  PlusCircle,
  Printer,
  PenIcon,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Swal from "sweetalert2";
import { generateInvoicePDF } from "../../../utils/generateInvoicePDF";

export default function Invoice() {
  const [customer, setCustomer] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("SI-000001");
  const [date, setDate] = useState("2025-09-30");
  const [dueDate, setDueDate] = useState("2025-09-30");
  const [reference, setReference] = useState("");
  const [subject, setSubject] = useState("");
  const [comments, setComments] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("%");
  const [shippingCharges, setShippingCharges] = useState(0);
  const [roundOff, setRoundOff] = useState(0);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [productOpens, setProductOpens] = useState({});
  const [productQueries, setProductQueries] = useState({});
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Create refs for form inputs
  const inputRefs = useRef({});
  const inputOrder = [
    "invoiceNumber",
    "date",
    "dueDate",
    "reference",
    "subject",
    "textarea",
    "quantity",
    "price",
    "disc",
    "actionCheck",
    "actionCross",
    "comments",
    "discount",
    "shippingCharges",
    "roundOff",
    "cashBankAccount",
    "paymentReference",
    "received",
    "generatePDF",
    "saveButton",
    "saveAndNewButton",
    "saveAndCloseButton",
    "cancelButton",
  ];

  // Function to handle Enter key press
  const handleEnterKeyPress = (e, currentField) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission

      const currentIndex = inputOrder.indexOf(currentField);
      if (currentIndex !== -1 && currentIndex < inputOrder.length - 1) {
        const nextField = inputOrder[currentIndex + 1];
        const nextInput = inputRefs.current[nextField];

        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  // Function to register input refs
  const registerRef = (fieldName) => (el) => {
    inputRefs.current[fieldName] = el;
  };

  // Customer and Product data
  const customers = [
    { value: "1", label: "Ali Khan" },
    { value: "2", label: "Sara Ahmed" },
    { value: "3", label: "Usman Raza" },
    { value: "4", label: "Ayesha Malik" },
    { value: "5", label: "Bilal Hussain" },
    { value: "6", label: "Fatima Noor" },
    { value: "7", label: "Hamza Qureshi" },
    { value: "8", label: "Hina Siddiqui" },
    { value: "9", label: "Zain Abbas" },
    { value: "10", label: "Mariam Ali" },
  ];

  const products = [
    { value: "product1", label: "Product 1" },
    { value: "product2", label: "Product 2" },
    { value: "product3", label: "Product 3" },
    { value: "product4", label: "Product 4" },
    { value: "product5", label: "Product 5" },
    { value: "product6", label: "Product 6" },
    { value: "product7", label: "Product 7" },
    { value: "product8", label: "Product 8" },
    { value: "product9", label: "Product 9" },
    { value: "product10", label: "Product 10" },
    { value: "product11", label: "Product 11" },
    { value: "product12", label: "Product 12" },
  ];

  const [items, setItems] = useState([
    {
      id: 1,
      product: "",
      description: "",
      quantity: 0,
      price: 0,
      disc: 0,
      discType: "%",
      amount: 0,
      filled: false,
    },
  ]);

  const calculateItemAmount = (item) => {
    const subtotal = item.quantity * item.price;
    const discAmount =
      item.discType === "%" ? (subtotal * item.disc) / 100 : item.disc;
    return subtotal - discAmount;
  };

  const updateItem = (id, field, value) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          updated.amount = calculateItemAmount(updated);
          return updated;
        }
        return item;
      })
    );
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        product: "",
        description: "",
        quantity: 0,
        price: 0,
        disc: 0,
        discType: "%",
        amount: 0,
        filled: false,
      },
    ]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  // Check if an item has required fields filled
  const isItemFilled = (item) => {
    return item.product && item.quantity > 0 && item.price > 0;
  };

  // Confirm a row (disable it and add new row)
  const confirmRow = (id) => {
    const item = items.find((item) => item.id === id);
    if (!isItemFilled(item)) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please fill in Product, Quantity, and Price before confirming.",
      });
      return;
    }

    // First update the current row to filled = true
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, filled: true } : item
    );

    // Check if we need to add a new row (no unfilled rows exist)
    const hasUnfilledRows = updatedItems.some((item) => !item.filled);

    if (!hasUnfilledRows) {
      // Add new row
      const newItem = {
        id: Date.now(),
        product: "",
        description: "",
        quantity: 0,
        price: 0,
        disc: 0,
        discType: "%",
        amount: 0,
        filled: false,
      };
      setItems([...updatedItems, newItem]);
    } else {
      setItems(updatedItems);
    }
  };

  // Edit a confirmed row (make it editable again)
  const editRow = (id) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, filled: false } : item))
    );
  };

  // Function to clear date
  const clearDate = (field) => {
    if (field === "date") {
      setDate("");
    } else if (field === "dueDate") {
      setDueDate("");
    }
  };

  // Reset query when popover closes
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filteredCustomers =
    query.trim() === ""
      ? customers
      : customers.filter((c) =>
          c.label.toLowerCase().includes(query.trim().toLowerCase())
        );

  const getFilteredProducts = (itemId) => {
    const productQuery = productQueries[itemId] || "";
    return productQuery.trim() === ""
      ? products
      : products.filter((p) =>
          p.label.toLowerCase().includes(productQuery.trim().toLowerCase())
        );
  };

  // Calculate totals
  const gross = items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount =
    discountType === "%" ? (gross * discount) / 100 : discount;
  const tax = 0;
  const total = gross - discountAmount + tax + shippingCharges + roundOff;

  // Calculate totals for display
  const totalProducts = items.filter(
    (item) => item.product && item.filled
  ).length;
  const totalQuantity = items.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  // File handling functions
  const handleFileUpload = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles).map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    handleFileUpload(droppedFiles);
  };

  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const downloadFile = (file) => {
    const url = URL.createObjectURL(file.file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // PDF Generation Function
  const handleGeneratePDF = () => {
    // Get selected customer details
    const selectedCustomer = customers.find((c) => c.value === customer);

    // Prepare invoice data
    const invoiceData = {
      customer: {
        name: selectedCustomer?.label || "",
        company: "Company Name",
        address: "Address Line 1",
        city: "City",
        country: "Country",
      },
      invoiceNumber,
      date,
      dueDate,
      reference,
      subject,
      items: items.filter((item) => item.filled && item.product),
      comments,
      totals: {
        gross,
        discount: discountAmount,
        tax,
        shippingCharges,
        roundOff,
        net: total,
      },
      payment: {
        cashBankAccount: "-Choose-",
        reference: "",
        received: 0,
      },
    };

    // Generate PDF
    generateInvoicePDF(invoiceData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" mx-auto  bg-white shadow-md rounded">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b-2 border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-800">
            Sale Invoices - [{invoiceNumber}]
          </h1>
          <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded font-medium">
            DRAFT
          </span>
        </div>

        <div className="p-6">
          {/* Top Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            {/* Customer Field */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer <span className="text-red-500">*</span>
              </label>

              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full h-8 px-3 justify-between text-sm border border-gray-300 rounded hover:bg-white focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {customer
                      ? customers.find((c) => c.value === customer)?.label
                      : "-- Select Customer --"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  className="w-full p-0 max-h-[240px] overflow-hidden"
                  align="start"
                >
                  <Command>
                    <CommandInput
                      placeholder="Search customers..."
                      value={query}
                      onValueChange={setQuery}
                      className="h-9"
                    />
                    <CommandEmpty>No customer found.</CommandEmpty>
                    <CommandGroup className="max-h-[200px] overflow-y-auto scrollbar-hide">
                      {filteredCustomers.map((c) => (
                        <CommandItem
                          key={c.value}
                          value={c.label}
                          onSelect={(currentValue) => {
                            const selectedCustomer = customers.find(
                              (customer) =>
                                customer.label.toLowerCase() ===
                                currentValue.toLowerCase()
                            );
                            setCustomer(
                              selectedCustomer ? selectedCustomer.value : ""
                            );
                            setOpen(false);
                            setQuery("");
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              customer === c.value ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          {c.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Number Field */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number <span className="text-red-500">*</span>
              </label>
              <div className="flex items-stretch h-8">
                <div className="relative flex-shrink-0">
                  <select className="h-full pl-2 bg-emerald-500 text-white rounded-l hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none  text-sm cursor-pointer">
                    <option>.</option>
                    <option>SI</option>
                    <option>INV</option>
                    <option>BILL</option>
                  </select>
                  <ChevronDown
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white pointer-events-none"
                    size={16}
                  />
                </div>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="flex-1 min-w-0 h-full px-3 border-t border-b border-r-0 border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:z-10"
                  onKeyDown={(e) => handleEnterKeyPress(e, "invoiceNumber")}
                  ref={registerRef("invoiceNumber")}
                />
                <button className="flex-shrink-0 h-full px-2 bg-emerald-500 text-white rounded-r hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center justify-center">
                  <RefreshCw size={12} />
                </button>
              </div>
            </div>

            {/* Date Field */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="flex items-stretch h-8 border border-gray-300 rounded overflow-hidden">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 min-w-0 h-full px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:z-10"
                  placeholder="YYYY-MM-DD"
                  onKeyDown={(e) => handleEnterKeyPress(e, "date")}
                  ref={registerRef("date")}
                />
                <button
                  onClick={() => clearDate("date")}
                  className="flex-shrink-0 h-full px-2 hover:bg-gray-50 flex items-center justify-center focus:outline-none border-l border-gray-300"
                  title="Clear date"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Due Date Field */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <div className="flex items-stretch h-8 border border-gray-300 rounded overflow-hidden">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex-1 min-w-0 h-full px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:z-10"
                  placeholder="YYYY-MM-DD"
                  onKeyDown={(e) => handleEnterKeyPress(e, "dueDate")}
                  ref={registerRef("dueDate")}
                />
                <button
                  onClick={() => clearDate("dueDate")}
                  className="flex-shrink-0 h-full px-2 hover:bg-gray-50 flex items-center justify-center focus:outline-none border-l border-gray-300"
                  title="Clear date"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Reference Field */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference
              </label>
              <input
                type="text"
                placeholder="Reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full h-8 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onKeyDown={(e) => handleEnterKeyPress(e, "reference")}
                ref={registerRef("reference")}
              />
            </div>
          </div>

          {/* Subject and Quick Add Button Row */}
          <div className="flex gap-4 items-end mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Subject
              </label>
              <input
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-1/2 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onKeyDown={(e) => handleEnterKeyPress(e, "subject")}
                ref={registerRef("subject")}
              />
            </div>
            <div>
              <button className="px-6 py-1.5 text-sm bg-emerald-500 text-white rounded hover:bg-emerald-600 flex items-center gap-2 whitespace-nowrap">
                <Scan size={18} />
                QUICKLY ADD PRODUCTS / SCAN
              </button>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse border items-table">
              <thead>
                <tr className="font-bold">
                  <th className="text-left p-3 border border-gray-300 font-medium text-gray-700 w-[20%]">
                    Product
                  </th>
                  <th className="text-end p-3 border border-gray-300 font-medium text-gray-700 w-[15%] ">
                    Quantity
                  </th>
                  <th className="text-end p-3 border border-gray-300 font-medium text-gray-700 w-[12%] ">
                    Price
                  </th>
                  <th className="text-end p-3 border border-gray-300 font-medium text-gray-700 w-[12%] ">
                    Disc.
                  </th>
                  <th className="text-end p-3 border border-gray-300 font-medium text-gray-700 w-[15%] ">
                    Amount
                  </th>
                  <th className="text-end p-3 border border-gray-300 font-medium text-gray-700 w-[10%] ">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="align-top border border-gray-300">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className={item.filled ? "bg-white" : "bg-gray-200"}
                  >
                    <td className="pt-2 px-1 border-b-1 border-gray-300  align-top">
                      <div className="relative mb-2 bg-white rounded">
                        <Popover
                          open={productOpens[item.id] || false}
                          onOpenChange={(open) =>
                            setProductOpens((prev) => ({
                              ...prev,
                              [item.id]: open,
                            }))
                          }
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={productOpens[item.id] || false}
                              disabled={item.filled}
                              className={`w-full h-8 px-2 justify-between text-sm border border-gray-300 rounded-sm ${
                                item.filled
                                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                  : "bg-white text-gray-700 hover:bg-white focus:ring-1 focus:ring-emerald-500"
                              }`}
                            >
                              {item.product
                                ? products.find((p) => p.value === item.product)
                                    ?.label
                                : "-- Select Product --"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-full p-0 max-h-[240px] overflow-hidden bg-white"
                            align="start"
                          >
                            <Command>
                              <CommandInput
                                placeholder="Search products..."
                                className="h-9"
                                value={productQueries[item.id] || ""}
                                onValueChange={(value) =>
                                  setProductQueries((prev) => ({
                                    ...prev,
                                    [item.id]: value,
                                  }))
                                }
                              />
                              <CommandEmpty>No product found.</CommandEmpty>
                              <CommandGroup className="max-h-[200px] overflow-y-auto scrollbar-hide ">
                                {getFilteredProducts(item.id).map((p) => (
                                  <CommandItem
                                    key={p.value}
                                    value={p.label}
                                    onSelect={(currentValue) => {
                                      const selectedProduct = products.find(
                                        (product) =>
                                          product.label.toLowerCase() ===
                                          currentValue.toLowerCase()
                                      );
                                      updateItem(
                                        item.id,
                                        "product",
                                        selectedProduct
                                          ? selectedProduct.value
                                          : ""
                                      );
                                      setProductOpens((prev) => ({
                                        ...prev,
                                        [item.id]: false,
                                      }));
                                      setProductQueries((prev) => ({
                                        ...prev,
                                        [item.id]: "",
                                      }));
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        item.product === p.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      }`}
                                    />
                                    {p.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <textarea
                        placeholder="Description"
                        value={item.description}
                        disabled={item.filled}
                        onChange={(e) =>
                          updateItem(item.id, "description", e.target.value)
                        }
                        className={`w-full px-2 py-1 border border-gray-300 rounded resize-none ${
                          item.filled
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : "bg-white text-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        }`}
                        rows={2}
                        onKeyDown={(e) => handleEnterKeyPress(e, "textarea")}
                        ref={registerRef("textarea")}
                      />
                    </td>
                    <td className="pt-2 px-1 border border-gray-300 ">
                      <input
                        type="number"
                        value={item.quantity}
                        disabled={item.filled}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "quantity",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        onKeyDown={(e) => handleEnterKeyPress(e, "quantity")}
                        ref={registerRef("quantity")}
                        className={`w-full py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                          item.filled
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : "bg-white text-gray-400"
                        }`}
                      />
                    </td>
                    <td className="px-1 py-2 border border-gray-300 text-center">
                      <input
                        type="number"
                        value={item.price}
                        disabled={item.filled}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        onKeyDown={(e) => handleEnterKeyPress(e, "price")}
                        ref={registerRef("price")}
                        className={`w-full py-1 border border-gray-300 rounded-sm text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                          item.filled
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : "bg-white text-gray-400"
                        }`}
                      />
                    </td>
                    <td className="pt-2 px-1 border border-gray-300 ">
                      <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden">
                        <input
                          type="number"
                          value={item.disc}
                          disabled={item.filled}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "disc",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          onKeyDown={(e) => handleEnterKeyPress(e, "disc")}
                          ref={registerRef("disc")}
                          className={`w-full py-1 border-r-1 border-gray-300 text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                            item.filled
                              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                              : "bg-white text-gray-400"
                          }`}
                        />
                        <div className="relative bg-gray-500">
                          <select
                            value={item.discType}
                            disabled={item.filled}
                            onChange={(e) =>
                              updateItem(item.id, "discType", e.target.value)
                            }
                            className={`appearance-none pl-2 pr-5 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                              item.filled
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-gray-300 text-gray-700"
                            }`}
                          >
                            <option>%</option>
                          </select>
                          <ChevronDown
                            className="absolute right-1 top-1/2 transform -translate-y-1/2  pointer-events-none"
                            size={14}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="pt-2 px-1 border border-gray-300 ">
                      <input
                        type="number"
                        value={item.amount.toFixed(2)}
                        disabled={true}
                        className="w-full py-1 border bg-gray-100 text-gray-500 border-gray-300 text-right rounded focus:outline-none cursor-not-allowed"
                        readOnly
                      />
                    </td>
                    <td className="p-3  border border-gray-300">
                      <div className="flex justify-end ">
                        {!item.filled ? (
                          <>
                            <button
                              onClick={() => confirmRow(item.id)}
                              className="text-gray-600 hover:text-emerald-700 p-1"
                              title="Confirm row"
                              onKeyDown={(e) =>
                                handleEnterKeyPress(e, "actionCheck")
                              }
                              ref={registerRef("actionCheck")}
                            >
                              <Check size={20} />
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-gray-600 hover:text-red-700 p-1"
                              title="Remove this row"
                              onKeyDown={(e) =>
                                handleEnterKeyPress(e, "actionCross")
                              }
                              ref={registerRef("actionCross")}
                            >
                              <X size={20} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => editRow(item.id)}
                              className="text-gray-600 hover:text-blue-700 p-1"
                              title="Edit this row"
                            >
                              <PenIcon size={20} />
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-gray-600 hover:text-red-700 p-1"
                              title="Remove this row"
                            >
                              <Trash2 size={20} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Table Summary */}
            <div className="mt-4 flex justify-end">
              <div className="bg-gray-100 px-4 py-2 rounded border">
                <span className="text-sm font-medium text-gray-700">
                  Total Products: {totalProducts} | Total Quantity:{" "}
                  {totalQuantity}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Comments */}
            <div className="w-[90%]">
              <textarea
                placeholder="Comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                rows={2}
                onKeyDown={(e) => handleEnterKeyPress(e, "comments")}
                ref={registerRef("comments")}
              />

              {/* Attachments */}
              <div className="mt-4 ">
                <label className="block text-md font-medium text-gray-800 mb-2">
                  Attachments
                </label>

                {/* File Upload Area */}
                <div
                  className={`flex flex-row justify-center items-center gap-3 border-2 border-dotted rounded-lg p-5 transition-colors ${
                    isDragOver
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-400 bg-gray-50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <p className="text-gray-400">Drop files here or</p>
                  <label className="px-6 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white text-sm rounded hover:from-blue-500 hover:to-blue-700 font-bold cursor-pointer">
                    BROWSE FILES
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xlsx,.xls"
                    />
                  </label>
                </div>

                {/* File List */}
                {files.length > 0 && (
                  <div className="mt-4 border border-gray-300 rounded-lg">
                    <div className="bg-gray-100 px-4 py-2 font-medium text-gray-700 rounded-t-lg">
                      Uploaded Files ({files.length})
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                              {file.type.includes("image") ? (
                                <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                                  <span className="text-green-600 text-xs font-bold">
                                    IMG
                                  </span>
                                </div>
                              ) : file.type.includes("pdf") ? (
                                <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                                  <span className="text-red-600 text-xs font-bold">
                                    PDF
                                  </span>
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                  <span className="text-blue-600 text-xs font-bold">
                                    DOC
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <button
                              onClick={() => downloadFile(file)}
                              className="p-1 text-gray-400 hover:text-emerald-600 transition-colors"
                              title="Download"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => removeFile(file.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Remove"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-3 w-full ml-auto">
              <div className="flex justify-end items-center">
                <span className="text-md mr-5 font-semibold text-gray-500">
                  Gross
                </span>
                <span className="w-3/5 text-right pr-4 ">
                  {gross.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-end items-center">
                <span className="text-md mr-5 font-semibold text-gray-500 ">
                  Discount
                </span>
                <div className="flex items-center  gap-4">
                  <div className=" border border-gray-300 rounded">
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) =>
                        setDiscount(parseFloat(e.target.value) || 0)
                      }
                      className="w-40 py-1 border-r-1 border-gray-300 text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      onKeyDown={(e) => handleEnterKeyPress(e, "discount")}
                      ref={registerRef("discount")}
                    />

                    <span className="bg-gray-300 text-gray-700 px-1 py-1.5 rounded-r ">
                      %
                    </span>
                  </div>
                  <span className=" border-gray-300 w-40 border py-1 rounded pr-4 text-right">
                    {discountAmount.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex justify-end items-center">
                <span className="text-md mr-5 font-semibold text-gray-500">
                  Tax
                </span>
                <span className=" pr-4  text-right w-3/5">
                  {tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-end items-center">
                <span className="text-md mr-5 font-semibold text-gray-500">
                  Shipping Charges
                </span>
                <input
                  type="number"
                  value={shippingCharges}
                  onChange={(e) =>
                    setShippingCharges(parseFloat(e.target.value) || 0)
                  }
                  className="w-3/5 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  onKeyDown={(e) => handleEnterKeyPress(e, "shippingCharges")}
                  ref={registerRef("shippingCharges")}
                />
              </div>
              <div className="flex justify-end items-center">
                <span className="text-md mr-5 font-semibold text-gray-500">
                  Round Off
                </span>
                <input
                  type="number"
                  value={roundOff}
                  onChange={(e) => setRoundOff(parseFloat(e.target.value) || 0)}
                  className="w-3/5  py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  onKeyDown={(e) => handleEnterKeyPress(e, "roundOff")}
                  ref={registerRef("roundOff")}
                />
              </div>

              <div className="flex items-center justify-end  py-2">
                <span className="text-md  mr-5 font-semibold text-gray-500">
                  Net (PKR)
                </span>
                <div className="border-t-2 border-b-2 border-gray-300 py-1 pr-4 w-3/5 text-right">
                  <span className="text-md font-semibold text-gray-800">
                    {total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="flex flex-cols-1 justify-end md:flex-cols-3 gap-4 mt-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Cash / Bank Account
              </label>
              <div className="relative">
                <select
                  className="w-full px-3 py-2 pr-14 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                  onKeyDown={(e) => handleEnterKeyPress(e, "cashBankAccount")}
                  ref={registerRef("cashBankAccount")}
                >
                  <option>-Choose-</option>
                  <option>Cash</option>
                  <option>Bank Account</option>
                </select>
                <ChevronDown
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={16}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Reference
              </label>
              <input
                type="text"
                placeholder="Reference"
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onKeyDown={(e) => handleEnterKeyPress(e, "paymentReference")}
                ref={registerRef("paymentReference")}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-right text-gray-700 mb-1">
                Received (PKR)
              </label>
              <input
                type="number"
                defaultValue={0}
                className="w-full pl-3 py-2 border text-right border-gray-300 rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onKeyDown={(e) => handleEnterKeyPress(e, "received")}
                ref={registerRef("received")}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mt-10 gap-3">
            {/* PDF Generation Button */}
            <button
              onClick={handleGeneratePDF}
              onKeyDown={(e) => handleEnterKeyPress(e, "generatePDF")}
              ref={registerRef("generatePDF")}
              className="px-6 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded hover:from-blue-500 hover:to-blue-700 flex items-center gap-2 transition-all"
            >
              <Printer size={16} />
              GENERATE PDF
            </button>

            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    onKeyDown={(e) => handleEnterKeyPress(e, "saveButton")}
                    ref={registerRef("saveButton")}
                    className="px-6 py-2 bg-gradient-to-r from-emerald-300 to-emerald-500 text-white rounded hover:from-emerald-400 hover:to-emerald-600 flex items-center gap-2 transition-all"
                  >
                    <Save size={16} />
                    SAVE AND CONTINUE EDIT
                    <ChevronDown size={16} className="ml-3" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  className="w-64 p-0 bg-gradient-to-r from-emerald-300 to-emerald-500 rounded"
                  align="end"
                  side="top"
                >
                  <div>
                    <button
                      onKeyDown={(e) =>
                        handleEnterKeyPress(e, "saveAndNewButton")
                      }
                      ref={registerRef("saveAndNewButton")}
                      className="flex items-center w-full px-4 py-3 text-sm text-white bg-gradient-to-r from-emerald-300 to-emerald-500 hover:from-emerald-500 hover:to-emerald-700 transition-all"
                    >
                      <PlusCircle size={16} className="mr-2" />
                      Save And New
                    </button>

                    <button
                      onKeyDown={(e) =>
                        handleEnterKeyPress(e, "saveAndCloseButton")
                      }
                      ref={registerRef("saveAndCloseButton")}
                      className="flex items-center w-full px-4 py-3 text-sm text-white bg-gradient-to-r from-emerald-300 to-emerald-500 hover:from-emerald-400 hover:to-emerald-600 transition-all"
                    >
                      <PlusCircle size={16} className="mr-2" />
                      Save And Close
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Close/Discard Button - Orange */}
            <button
              onKeyDown={(e) => handleEnterKeyPress(e, "cancelButton")}
              ref={registerRef("cancelButton")}
              className="px-6 py-2 bg-gradient-to-r from-yellow-300 to-yellow-500 text-white rounded hover:from-yellow-500 hover:to-yellow-600 flex items-center gap-2 transition-all"
            >
              <X size={16} />
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
