"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    image?: string;
}

interface Order {
    id: string;
    date: string;
    status: "Diproses" | "Dikirim" | "Selesai" | "Dibatalkan";
    items: OrderItem[];
    total: number;
}

const MOCK_ORDERS: Order[] = [
    {
        id: "ORD-2023-8890",
        date: "12 Okt 2023",
        status: "Selesai",
        items: [
            {
                name: "Pandan Cheese Roll",
                quantity: 1,
                price: 85000,
                image:
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuCNydJNw3fbGGBLqF_u5-6Wqxn6hfsTLnyEjG7f9K1yljWKdah1-eLOc1NChrqdssyXE5-DWd6IdzZrT4IAzc_tfYx7P964RTloTR2IjJuWA_IpkLnn6rDWUiXb-nWtSlN2hU74fyz95er73E3z4jIpVA0tUPwZ-Ijd0AIQChH-7F6em_WZb3YthGIR9pNlNxhK6WeqbRmRcjxSMxyzt8SjpVbHDI46oJWvVG1E_zXNLtJgxfFcxZC-FtarCFot63U8WskUmlt_6tol",
            },
        ],
        total: 105000,
    },
    {
        id: "ORD-2023-8942",
        date: "28 Okt 2023",
        status: "Dikirim",
        items: [
            {
                name: "Assorted Roti Manis Box",
                quantity: 2,
                price: 60000,
                image:
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuDcINj5tuAmlS2lsExYQM30x_5fHZtsTdqx12bDougV4yDeaGRcw8vzlzZB7d9qdLX8nnXtR2eP1EhsEfSRURkn5inMswwH9v1w1McvNIpLVl2w1gsN7nxjmwslpLWMI6qxgXoVuBBbRXhVytk9xVzcyO-W-NpH8RAG6oo2wCF282xQGfUc-TbTpFxTfgh-llHM60OhA5W7uDwNqcbroq4WI9Gcc50nnKxUQcFfZGuyVbMBSHbLQUU85gg8ybmxboY-lPGTkQKnR81w",
            },
        ],
        total: 135000,
    },
];

const statusConfig: Record<
    Order["status"],
    { label: string; className: string; icon: string }
> = {
    Selesai: {
        label: "Selesai",
        className: "bg-tertiary-container text-on-tertiary-container",
        icon: "check_circle",
    },
    Dikirim: {
        label: "Dikirim",
        className: "bg-inverse-primary text-on-primary-fixed",
        icon: "local_shipping",
    },
    Diproses: {
        label: "Diproses",
        className: "bg-primary-fixed text-on-primary-fixed-variant",
        icon: "hourglass_empty",
    },
    Dibatalkan: {
        label: "Dibatalkan",
        className: "bg-error-container text-on-error-container",
        icon: "cancel",
    },
};

export default function OrdersPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [name, setName] = useState("John Doe");
    const [email, setEmail] = useState("john@example.com");
    const [orders] = useState<Order[]>(MOCK_ORDERS);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const userObj = JSON.parse(storedUser);
                if (userObj.name) setName(userObj.name);
                if (userObj.email) setEmail(userObj.email);
            }
        } catch (e) {
            console.error("Failed to load user from storage", e);
        }
    }, []);

    const handleLogout = () => {
        try {
            localStorage.removeItem("user");
        } catch (e) {
            console.error(e);
        }
        router.push("/login");
    };

    const formatPrice = (value: number) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(value);

    const getInitials = (fullName: string) =>
        fullName
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase() || "U";

    if (!mounted) {
        return (
            <div className="bg-background text-on-background min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow flex items-center justify-center pt-24 pb-16">
                    <div className="text-center py-12">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-on-surface-variant font-medium">Memuat pesanan...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
            <Navbar />

            {/* Main Content */}
            <main className="flex-grow pt-24 pb-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full flex flex-col md:flex-row gap-8">

                {/* ── Sidebar ── */}
                <aside className="w-full md:w-64 shrink-0 bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant h-fit">
                    {/* User Info */}
                    <div className="flex items-center space-x-4 mb-8 p-2">
                        <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg select-none">
                            {getInitials(name)}
                        </div>
                        <div className="min-w-0">
                            <div className="font-headline-md text-body-lg text-on-surface font-bold truncate">
                                {name}
                            </div>
                            <div className="font-body-md text-label-sm text-on-surface-variant truncate">
                                {email}
                            </div>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex flex-col space-y-2">
                        <Link
                            href="/profile"
                            className="flex items-center space-x-3 p-3 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined">person</span>
                            <span className="font-body-md text-body-md">Profil Saya</span>
                        </Link>

                        <Link
                            href="/orders"
                            className="flex items-center space-x-3 p-3 rounded-lg bg-primary-container text-on-primary-container font-semibold transition-colors"
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                receipt_long
                            </span>
                            <span className="font-body-md text-body-md">Pesanan Saya</span>
                        </Link>

                        <Link
                            href="/profile#addresses"
                            className="flex items-center space-x-3 p-3 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined">location_on</span>
                            <span className="font-body-md text-body-md">Alamat</span>
                        </Link>

                        <div className="my-4 border-t border-outline-variant" />

                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 p-3 rounded-lg text-error hover:bg-error-container w-full text-left transition-colors"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            <span className="font-body-md text-body-md">Keluar</span>
                        </button>
                    </nav>
                </aside>

                {/* ── Orders List ── */}
                <section className="flex-grow">
                    <h1 className="font-headline-md text-headline-md text-on-surface mb-6 font-bold">
                        Pesanan Saya
                    </h1>

                    {orders.length === 0 ? (
                        /* Empty state */
                        <div className="bg-surface-container-lowest rounded-xl p-12 shadow-sm border border-outline-variant text-center">
                            <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 block">
                                receipt_long
                            </span>
                            <p className="text-on-surface-variant font-body-md text-body-md">
                                Kamu belum memiliki pesanan.
                            </p>
                            <Link
                                href="/products"
                                className="mt-6 inline-block px-6 py-2 rounded-lg bg-primary text-on-primary font-bold hover:opacity-90 transition-opacity"
                            >
                                Mulai Belanja
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => {
                                const status = statusConfig[order.status];
                                const isExpanded = expandedOrder === order.id;

                                return (
                                    <div
                                        key={order.id}
                                        className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant hover:shadow-md transition-shadow"
                                    >
                                        {/* Order Header */}
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-outline-variant pb-4 mb-4 gap-4">
                                            <div>
                                                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                                                    Order ID
                                                </span>
                                                <div className="font-body-lg text-body-lg font-bold text-on-surface">
                                                    #{order.id}
                                                </div>
                                                <div className="font-body-md text-body-md text-on-surface-variant mt-1">
                                                    {order.date}
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div
                                                className={`flex items-center space-x-1 px-3 py-1 rounded-full font-label-sm text-label-sm ${status.className}`}
                                            >
                                                <span className="material-symbols-outlined text-[16px]">
                                                    {status.icon}
                                                </span>
                                                <span>{status.label}</span>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="space-y-4 mb-4">
                                            {order.items.map((item, index) => (
                                                <div key={index} className="flex items-center space-x-4">
                                                    {item.image ? (
                                                        <div
                                                            className="w-16 h-16 rounded bg-surface-variant flex-shrink-0 bg-cover bg-center"
                                                            style={{ backgroundImage: `url('${item.image}')` }}
                                                            aria-label={item.name}
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-16 rounded bg-surface-variant flex-shrink-0 flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-on-surface-variant">
                                                                cake
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex-grow">
                                                        <div className="font-body-lg text-body-md font-semibold text-on-surface">
                                                            {item.name}
                                                        </div>
                                                        <div className="font-body-md text-body-md text-on-surface-variant">
                                                            {item.quantity} x {formatPrice(item.price)}
                                                        </div>
                                                    </div>
                                                    <div className="font-bold text-on-surface text-sm">
                                                        {formatPrice(item.price * item.quantity)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Order Footer */}
                                        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-outline-variant gap-4">
                                            <div className="text-center sm:text-left w-full sm:w-auto">
                                                <span className="font-body-md text-body-md text-on-surface-variant block">
                                                    Total Belanja
                                                </span>
                                                <div className="font-headline-md text-body-lg font-bold text-primary">
                                                    {formatPrice(order.total)}
                                                </div>
                                            </div>

                                            <div className="flex gap-3 w-full sm:w-auto">
                                                {/* Detail toggle */}
                                                <button
                                                    onClick={() =>
                                                        setExpandedOrder(isExpanded ? null : order.id)
                                                    }
                                                    className="flex-1 sm:flex-none px-6 py-2 rounded-lg border-2 border-tertiary text-tertiary font-body-md text-body-md hover:bg-tertiary hover:text-on-tertiary transition-colors h-12 flex items-center justify-center gap-1"
                                                >
                                                    <span>Lihat Detail</span>
                                                    <span className="material-symbols-outlined text-[18px]">
                                                        {isExpanded ? "expand_less" : "expand_more"}
                                                    </span>
                                                </button>

                                                {/* Re-order button for completed orders */}
                                                {order.status === "Selesai" && (
                                                    <Link
                                                        href="/products"
                                                        className="flex-1 sm:flex-none px-6 py-2 rounded-lg bg-primary-container text-on-primary-container font-bold font-body-md text-body-md hover:bg-primary hover:text-on-primary transition-colors h-12 flex items-center justify-center gap-1"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">
                                                            shopping_bag
                                                        </span>
                                                        <span>Beli Lagi</span>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded Detail Panel */}
                                        {isExpanded && (
                                            <div className="mt-4 pt-4 border-t border-outline-variant space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-3">
                                                    Rincian Pesanan
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-on-surface-variant font-semibold">Status</p>
                                                        <p className="text-on-surface">{order.status}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-on-surface-variant font-semibold">Tanggal Order</p>
                                                        <p className="text-on-surface">{order.date}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-on-surface-variant font-semibold">Nomor Order</p>
                                                        <p className="text-on-surface font-bold">#{order.id}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-on-surface-variant font-semibold">Total Pembayaran</p>
                                                        <p className="text-primary font-bold">{formatPrice(order.total)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>

            <Footer />
            <CartDrawer />
        </div>
    );
}
