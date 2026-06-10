export interface ProductSizeOption {
  name: string;
  price: number;
}

export interface ProductData {
  id: string;
  name: string;
  price: number;
  category: string;
  tag?: string;
  image: string;
  description: string;
  ingredients: string[];
  allergens: string[];
  unit?: string;
  gallery?: string[];
  sizes?: ProductSizeOption[];
}

export const PRODUCTS: ProductData[] = [
  {
    id: "roti-sisir",
    name: "Roti Sisir Mentega",
    price: 45000,
    category: "Roti Manis",
    tag: "Favorit Keluarga",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCa0wQH7v7z8p5IgK0yZlPJy29Lbja_DHdcCxSvgLdqnrzXOpbIgfVsKdoIh609bIqTHpzn3esdihwNYdNdt9RrABKEIxkWCkIkvcMN7JrDvZyhC--ggsBlu3qtCE1oJxs3HVcD1HMywg3FGUukKtNm2VFpRUKXAFSZrv_MDSzGhh4Kqyznur5ixVcwA0DVYuILlar1mVRsNgugPo2rQlEovNqagqQ6WenRiiJeUEryVqNaEMtO73nrhkFI6xMznKGWDpDiGOlHz1Hv",
    description: "Roti manis klasik dengan olesan mentega melimpah dan gula premium. Lembut dan harum.",
    ingredients: ["Tepung Terigu Protein Tinggi", "Mentega Premium", "Kuning Telur Organik", "Gula Tebu Pilihan", "Ragi Alami"],
    allergens: ["Mengandung Gluten (Tepung Terigu)", "Produk Susu (Mentega)", "Telur"],
    sizes: [
      { name: "Reguler (10 Slice)", price: 45000 },
      { name: "Besar (20 Slice)", price: 85000 }
    ]
  },
  {
    id: "nastar-wisman",
    name: "Nastar Klasik Wisman",
    price: 120000,
    category: "Kue Kering",
    tag: "Baru",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9oC5JnYK-5oY1ZATXFL3oqfBJevldk-vL5IF03iWw468o1BksgRbTw8hcaDckup9JoluzL6zd8EKfiYlDKnd3h_0j_7itJh5WlezFStIwa35UOhyNAE6s3FIbGCigKj596VypA4ziu40WjW88BEmujUWwiF6RRo692ZsWFIJTSS5tUtIaw__E3N7qFBnhBxUJnGOk-RXgToKeQG5v17N_hyVNwgHkryc1yQg0nqE3sKFVaB2grHSg3abJ14_hgeMAH5oZ2abTz3gU",
    description: "Kue kering ikonik dengan selai nanas asli buatan sendiri dan butter Wisman yang lumer di mulut.",
    ingredients: ["Selai Nanas Asli (Nanas Madu & Gula Semut)", "Butter Wisman", "Tepung Terigu Rendah Protein", "Maizena", "Susu Bubuk"],
    allergens: ["Mengandung Gluten", "Produk Susu", "Telur"],
    sizes: [
      { name: "Toples Sedang (250g)", price: 120000 },
      { name: "Toples Besar (500g)", price: 220000 }
    ]
  },
  {
    id: "kue-ku",
    name: "Kue Ku Kacang Hijau",
    price: 7500,
    unit: "/ pcs",
    category: "Jajanan Pasar",
    tag: "Tradisional",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCByCzim_7g9rmjjGklYsPD3XBAY81iE-fFpnBQ_uctNvkggR-fQDzVYOG3SpktnLlePS-WXD1IcO5XU14RrwRaAOkKH59Bb332jguxtahrpsR6WhqZ6usjWMHBVX_rY_LdXquYwal4FRSBiYNR5tHVc2Rj_k1JQAgEbSxTYdld9odTqWULpR3nl4gDwzpvD0gU0gnWeGXeZ7tiO_CCBysIhdIO374Ck-oPIbUnWMyGZKKAJ0-b4kt5SLuFc1NdeXPjzjhaF-tmMES7",
    description: "Jajanan pasar kenyal dengan isian kacang hijau kupas yang manis legit. Dibungkus daun pisang asli.",
    ingredients: ["Tepung Ketan Putih", "Kacang Hijau Kupas", "Santan Kelapa Murni", "Gula Pasir", "Daun Pisang"],
    allergens: ["Kacang Hijau"]
  },
  {
    id: "bolu-pandan",
    name: "Bolu Pandan Klasik",
    price: 85000,
    category: "Roti Manis",
    tag: "Favorit",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCaZqK9s8MunZ_UUWZN9rnoCAdYbDgxwKcGwNkmGMOvXPO4YvJ6WYUqmpX_llI6EyiHs-x2asTqRV5P-p_0ESBNu-2lXdW3Ada7_1NCIITylT9mv9s-LicwZ8nxB_l4Lo79sF63Q6bBR2ke2VPe3F83UvmAkP4JZIkAnu5a3HzQh7VX_IgwxGu4ThlEGahC-jTWHG-CiBCoiW119XMIPYkuRRHwr-DDuihlvBRt6dzEX2imf-3KdnxBqJQWRDdH3rArNHfSpt_nQhr3",
    description: "Nikmati kelembutan otentik dari Bolu Pandan Klasik kami. Dibuat dengan perasan daun pandan asli yang memberikan aroma harum yang menenangkan dan warna hijau alami yang menggugah selera. Teksturnya yang sangat empuk dan moist di setiap gigitan akan membawa Anda kembali ke momen hangat bersama keluarga. Tanpa pengawet dan pemanis buatan, murni kebaikan tradisi.",
    ingredients: ["Sari Daun Pandan Asli", "Tepung Terigu Premium", "Telur Segar Pilihan", "Santan Kelapa Murni"],
    allergens: ["Mengandung Gluten", "Telur", "Santan Kelapa"],
    gallery: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCaZqK9s8MunZ_UUWZN9rnoCAdYbDgxwKcGwNkmGMOvXPO4YvJ6WYUqmpX_llI6EyiHs-x2asTqRV5P-p_0ESBNu-2lXdW3Ada7_1NCIITylT9mv9s-LicwZ8nxB_l4Lo79sF63Q6bBR2ke2VPe3F83UvmAkP4JZIkAnu5a3HzQh7VX_IgwxGu4ThlEGahC-jTWHG-CiBCoiW119XMIPYkuRRHwr-DDuihlvBRt6dzEX2imf-3KdnxBqJQWRDdH3rArNHfSpt_nQhr3",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAewN8h8mWmZ3snM8oFwy_BT7M538gFGsgd-OgJ4M9s5aJ3Rd8WfeccQtYs4BbJUJ44D-97CXiNMFuOv3o8yT8ilBVweMT4Xuf_s92kEZolfviVVX9xSkXqC7WVYCOuXaUoF2_LpHmuvKyRLHurgIs9HYIjCYjqSMaOy5pZ6VxS6w9ZE5iSZnOGDNNEoWsVXyHxEP2RQ6stufwdtVx3Vgls0yQXjkXZp6H6hCQHlJZT1Rshm0fAD32_zPGHRxuF2e4aa0CkMGVcoBhG",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAjZCVKanWGoyFvkmfodjfK1EDB-7StAL0WOdkx6qw77wA1wFUVt4adqzozTBCEhWRffv6D-LAB8ivzQ1bQJOsOnFgqY3ULDRUCPHIq-0bdGRkRH6fbM8pyQiekV4Bz1iEMX4Ab0rf5zbF5mWQ2m7uwJUvBNoK-GbQBGMN8aHKE2KryiA8xdHb74kaSKfDGjb-oTUymGiGrKR5YMjtiJw4aVJiT8WI6KMRE0koLta9TQ4YCWNwCxL04Ai94mNLTVWLk7Tl_eKrIRu0h"
    ],
    sizes: [
      { name: "Reguler (20cm)", price: 85000 },
      { name: "Besar (24cm)", price: 125000 }
    ]
  },
  {
    id: "lapis-legit",
    name: "Lapis Legit Spekuk",
    price: 180000,
    category: "Kue Kering",
    tag: "Terlaris",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWQ-VBmnDBtcoX1pPlu2nJg9ZJUovc907njeag3n-QMMCHfpZr2oM0KNjdhZ_mvGgUt5CmdcGT9wJM9WlLStLRfrO9P-7HLi847ZICn7oyU9bTFB4Q01gwn2tWk4IcATU4HOTnEiIddcJr892LMecZMFHRYwkM2tJyeuct-L4vwz6n5wG4EWjWGyWef8sJg0Yhn4FN5Bz2UzMUSOQPkv7Tt2MaxAB_YLrwHKIhvjWkn86s-aRHjwSqDnOcr-byIb7WUrt-17sSyatA",
    description: "Lapis legit legendaris beraroma bumbu spekuk harum, dibuat dengan puluhan kuning telur berkualitas tinggi dan mentega impor.",
    ingredients: ["Kuning Telur Ayam Organik", "Butter Premium", "Gula Halus", "Tepung Terigu Rendah Gluten", "Bubuk Spekuk Pilihan"],
    allergens: ["Mengandung Gluten", "Produk Susu", "Telur"],
    sizes: [
      { name: "Ukuran Sedang (10x20cm)", price: 180000 },
      { name: "Ukuran Besar (20x20cm)", price: 340000 }
    ]
  },
  {
    id: "klepon",
    name: "Klepon Gula Merah",
    price: 15000,
    unit: "/ porsi",
    category: "Jajanan Pasar",
    tag: "Tradisional",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZw1fFDTyETRsDVXKOhZnZtxuYuH-kxjf5EWkoWFNb8Uyz3V2gGjt0KKiJ4q8-cj9Dj0FrUsw_hgrkNVhT1spOQngExz_i9BrNpJNSuE2Tjh_LzLGH-ZCuGfz2A2KX8Mj8-IQ39LWbG-OCbtafNU-PHKK9Nir_SFokjJWfoc2jcu7t6YDMSKbkLW8ls5sjk1Ezd3-BZ5TqETZTxV9gBSPpHXVJ7vN0hayRK3QV--U0bHWa7szl0LwmsWmQnL_4BFOFbRCug_1zy325",
    description: "Bola ketan kenyal isi gula merah cair yang melumer saat digigit, dibalur dengan kelapa parut segar yang gurih.",
    ingredients: ["Tepung Ketan Putih", "Gula Merah Aren Cair", "Ekstrak Daun Pandan", "Kelapa Parut Setengah Tua", "Garam"],
    allergens: ["Kelapa Parut"]
  },
  {
    id: "roti-sobek",
    name: "Roti Sobek Cokelat Keju",
    price: 50000,
    category: "Roti Manis",
    tag: "Favorit Keluarga",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCe6PqN6eQf_CwHvCvZEhGaNd8Q6m6acLTBhdd8Odi-kF-ZvDd1ggx4ZfINgKtJEwaInkscS0LvkmjB0rj_zK8upwombuXM93x2px1WepJ-zMx-bQLWxUXU4d3uZBnl2b1OcMox_U1r574_w7jpqIILjh--3AYuQt-dHe1taIRgfwLaZs-ya_k7HS4Fh4vRPtq_X7EXzNVL1NrlbbdXrXUwDBnG3tMDr458AkjgXd5lR_rSFfIC_UAeD3pConitIxMNAYmnDYl4aJDz",
    description: "Roti sobek super empuk dengan separuh isian cokelat lumer premium dan separuh keju cheddar gurih.",
    ingredients: ["Tepung Terigu Protein Tinggi", "Ragi Alami", "Susu Cair Segar", "Butter Premium", "Cokelat Batang", "Keju Cheddar"],
    allergens: ["Mengandung Gluten", "Produk Susu", "Telur"]
  },
  {
    id: "kastengel",
    name: "Kastengel Keju Edam",
    price: 110000,
    category: "Kue Kering",
    tag: "Baru",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9oC5JnYK-5oY1ZATXFL3oqfBJevldk-vL5IF03iWw468o1BksgRbTw8hcaDckup9JoluzL6zd8EKfiYlDKnd3h_0j_7itJh5WlezFStIwa35UOhyNAE6s3FIbGCigKj596VypA4ziu40WjW88BEmujUWwiF6RRo692ZsWFIJTSS5tUtIaw__E3N7qFBnhBxUJnGOk-RXgToKeQG5v17N_hyVNwgHkryc1yQg0nqE3sKFVaB2grHSg3abJ14_hgeMAH5oZ2abTz3gU",
    description: "Kue kering kastengel gurih renyah bertabur keju cheddar parut melimpah dan adonan beraroma keju Edam impor.",
    ingredients: ["Keju Edam Impor", "Butter Wisman", "Tepung Terigu Protein Rendah", "Kuning Telur", "Keju Cheddar Parut"],
    allergens: ["Mengandung Gluten", "Produk Susu", "Telur"],
    sizes: [
      { name: "Toples Sedang (250g)", price: 110000 },
      { name: "Toples Besar (500g)", price: 200000 }
    ]
  },
  {
    id: "bolu-meises",
    name: "Bolu Coklat Meises",
    price: 65000,
    category: "Roti Manis",
    tag: "Tradisional",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5t7S0EPJgOo65sT7WB4JPbzt_YWHY3EJsr30FPGpygTrv6tPvrBlXRbXaZGiaWKFGg-ZGvJRTlTFrN-Uhx9-y7bxjx3Bro25Pr6vQDsSKj5ozchA63Mb2eaSvhfnCXZorJ7e4Y2QUyDVCmKHX7VWZdVhxDeJ7Oi1K9ht8lVSbs3HddDb3egXz4Q5DgXMGM_I8Jx2i6X8FK20_xRSFMFweWFCLhdk_fcfHAL6WKEKbxX70qP3akHUjwdnKA9CU9Qf3M0Sd3WBjsQBD",
    description: "Bolu jadul legendaris beraroma cokelat harum, dilapisi krim lembut dan taburan cokelat meises klasik melimpah di seluruh permukaannya.",
    ingredients: ["Tepung Terigu Pilihan", "Cokelat Bubuk Premium", "Mentega", "Kuning Telur Ayam", "Cokelat Meises Cokelat"],
    allergens: ["Mengandung Gluten", "Produk Susu", "Telur"],
    sizes: [
      { name: "Ukuran Sedang (20x10cm)", price: 65000 },
      { name: "Ukuran Besar (20x20cm)", price: 120000 }
    ]
  },
  {
    id: "bolu-keju",
    name: "Bolu Keju Lembut",
    price: 75000,
    category: "Roti Manis",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBbSTu8ZuOA4AhAUwTOFHj6-_E-2jN127_AIMC7RKb_H9tRc4H0DZKlQBVEbbNRl22nUrAfxSpGl30Qj6x6qWjHUMxLrPNtXtBlxAni-kIHpzUOYCAXYmpkSni2RH35rebtJwsgaG1TBTxs0bWCKntVu1ILLeh3EE8HAkHlwuTHOeRYbaNjrBTbKaoN0XxE22Jcxwr5-97HPRtqbFadZC7fBCeSm-zKqSDAMAhXYW1bgvSJ1dpJ-dj3uJxTiTmKU0Y7ngsveNttQcPy",
    description: "Sponge cake super lembut berselimut buttercream harum dan taburan keju cheddar parut melimpah yang memberikan sensasi gurih manis.",
    ingredients: ["Tepung Terigu Protein Sedang", "Mentega Premium", "Telur Ayam Segar", "Gula Pasir Pilihan", "Keju Cheddar Parut"],
    allergens: ["Mengandung Gluten", "Produk Susu (Butter, Keju)", "Telur"],
    sizes: [
      { name: "Ukuran Sedang (20x10cm)", price: 75000 },
      { name: "Ukuran Besar (20x20cm)", price: 140000 }
    ]
  },
  {
    id: "lapis-legit-original",
    name: "Lapis Legit Original",
    price: 250000,
    category: "Kue Kering",
    tag: "Premium",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3kRuJDoqikhpuKDNhgLTUeFxobJtOqhtNT85U1AjZz5-A9IE0wymYJK5rAf5sWCNGdFck0Oi9cmt-V5RCddpk-gQfH5MJVXbF20t6B076oqkR6fUTgOt-EK6DsBo7X0VD0RB17a75fRz6oafEaqBbj-an3W08_wA1OIDYT17YjU7MelQCqFxApJAcMexbAdZrPEIZZpXT4QD1vIzEwQQLzz_9amXEqqncnalCXpnRjeaovwm9LTZadylAZWygkTVk3JPOtglJqqTo",
    description: "Lapis legit original bertekstur lembut dan beraroma wangi mentega Wisman yang sangat harum di setiap lapisannya yang rapi dan padat.",
    ingredients: ["Kuning Telur Organik", "Mentega Wisman", "Tepung Terigu Rendah Gluten", "Gula Halus", "Susu Bubuk Full Cream"],
    allergens: ["Mengandung Gluten", "Produk Susu", "Telur"],
    sizes: [
      { name: "Ukuran Sedang (10x20cm)", price: 250000 },
      { name: "Ukuran Besar (20x20cm)", price: 480000 }
    ]
  },
  {
    id: "bolu-gulung",
    name: "Bolu Gulung Stroberi",
    price: 60000,
    category: "Roti Manis",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9cJ3h2C4TKgdTKaLnxyBuJGMj-y6lmAFNDWsJPDSzzwCv93XBIcTiOoCF-z0RvS-Atv7_KffhAwNoqRAhH6D-KYyKTqIcvGfXnFhPcUCffxLXPXwHkMo104_8seYcSlwLaxhD_MMb-xWNJZP3KfdbiG9khD_sB5MmGVrGkEq3B8Tlg80iMPIeln1eTRd02UTwaBMxb0LbCu-9XpzGGSXfdnAv6DxlO_b8mugJnNNkftiZ-DFAP8SQiq411B1ZaXyDAa2fs3cj3s1k",
    description: "Bolu gulung lembut dengan isian selai stroberi asam manis segar premium dan taburan gula bubuk halus di atasnya.",
    ingredients: ["Tepung Terigu Pilihan", "Selai Stroberi Alami", "Gula Pasir", "Telur Segar Pilihan", "Mentega Terpilih"],
    allergens: ["Mengandung Gluten", "Telur"]
  }
];
