'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Menu, Search, ChevronLeft, ChevronRight, MessageCircle, Instagram, Facebook, MapPin, Clock, ShieldCheck, Zap, Package, Headphones, X, ArrowRight, Circle, Lock, Wind, Sun, Moon } from 'lucide-react'
import { apiFetch, openWhatsApp, buildProductMessage, trackWhatsAppClick } from '@/lib/api'

function ThemeToggle() {
  const [theme, setTheme] = useState('dark')
  useEffect(() => {
    setTheme(document.documentElement.classList.contains('light') ? 'light' : 'dark')
  }, [])
  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(next)
    try { localStorage.setItem('cd_theme', next) } catch {}
    setTheme(next)
  }
  return (
    <Button variant="ghost" size="icon" onClick={toggle} className="h-9 w-9" title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}

function AgeGate({ onConfirm }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const ok = localStorage.getItem('cd_age_ok')
    if (!ok) setOpen(true)
    else onConfirm()
  }, [])
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="glass-strong max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <ShieldCheck className="h-7 w-7 text-white/80" />
          </div>
          <DialogTitle className="text-center text-2xl font-semibold">Verificación de edad</DialogTitle>
          <DialogDescription className="text-center text-white/60 pt-2">
            Este sitio está dirigido exclusivamente a personas mayores de edad. Confirma que cumples con la edad legal requerida en tu país.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={() => { localStorage.setItem('cd_age_ok', '1'); setOpen(false); onConfirm() }} className="w-full h-12 btn-primary-tesla font-semibold">Soy mayor de edad</Button>
          <Button variant="ghost" onClick={() => { window.location.href = 'https://google.com' }} className="w-full h-12 text-white/60 hover:text-white">Salir</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Header({ settings, onSearch, searchQuery }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', on)
    return () => window.removeEventListener('scroll', on)
  }, [])

  const nav = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Productos', href: '#productos' },
    { label: 'Categorías', href: '#categorias' },
    { label: 'Destacados', href: '#destacados' },
    { label: 'Contacto', href: '#contacto' },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? 'glass-strong py-3' : 'py-5'}`}>
      <div className="container mx-auto px-4 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-b from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center shadow-md shadow-black/40">
            <Wind className="h-5 w-5 text-zinc-100" />
          </div>
          <span className="font-semibold text-lg tracking-tight">{settings?.storeName || 'Cloud District'}</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 ml-8">
          {nav.map(n => (
            <a key={n.href} href={n.href} className="text-sm text-white/60 hover:text-white transition-colors">{n.label}</a>
          ))}
        </nav>

        <div className="flex-1" />

        <div className={`hidden md:flex items-center transition-all ${showSearch ? 'w-64' : 'w-10'}`}>
          {showSearch ? (
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input value={searchQuery} onChange={(e) => onSearch(e.target.value)} placeholder="Buscar productos..." className="pl-9 h-9 glass border-white/10" autoFocus onBlur={() => !searchQuery && setShowSearch(false)} />
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)} className="h-9 w-9"><Search className="h-4 w-4" /></Button>
          )}
        </div>

        <Button asChild variant="ghost" className="hidden sm:inline-flex text-white/70 hover:text-white h-9 gap-2">
          <Link href="/admin"><Lock className="h-4 w-4" /> Iniciar sesión</Link>
        </Button>

        <ThemeToggle />

        <Button onClick={() => { trackWhatsAppClick({ source: 'header' }); openWhatsApp({ number: settings?.whatsappNumber, message: settings?.whatsappMessage }) }} className="hidden sm:inline-flex btn-primary-tesla h-9 gap-2 font-medium">
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </Button>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden"><Menu className="h-5 w-5" /></Button>
          </SheetTrigger>
          <SheetContent className="glass-strong w-80">
            <div className="flex flex-col gap-5 pt-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <Input value={searchQuery} onChange={(e) => onSearch(e.target.value)} placeholder="Buscar..." className="pl-9 glass border-white/10" />
              </div>
              {nav.map(n => (
                <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)} className="text-lg text-white/80 hover:text-white">{n.label}</a>
              ))}
              <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-lg text-white/80 hover:text-white flex items-center gap-2"><Lock className="h-4 w-4" /> Iniciar sesión</Link>
              <div className="flex items-center gap-2"><ThemeToggle /> <span className="text-sm text-white/60">Cambiar tema</span></div>
              <Button onClick={() => { openWhatsApp({ number: settings?.whatsappNumber, message: settings?.whatsappMessage }); setMenuOpen(false) }} className="btn-primary-tesla gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

function Hero({ settings }) {
  const heroImg = 'https://images.unsplash.com/photo-1545095088-26a59e3f2717?w=1400'
  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden pt-24">
      <div className="absolute inset-0 radial-bg" />
      <div className="absolute inset-0">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="particle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: `${8 + Math.random() * 20}px`, height: `${8 + Math.random() * 20}px`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${5 + Math.random() * 8}s` }} />
        ))}
      </div>
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Badge className="mb-6 glass border-white/10 text-white/70 px-3 py-1 gap-1.5 font-normal"><Circle className="h-2 w-2 fill-white/80" /> Nueva colección 40K disponible</Badge>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 leading-[1.05]">
            Descubre una<br />
            <span className="gradient-text">nueva experiencia</span>
          </h1>
          <p className="text-lg text-white/60 mb-8 max-w-lg">
            Vape desechable premium hasta 40,000 puffs y mieles artesanales seleccionadas. Todo lo que buscas, en un solo lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="btn-primary-tesla h-13 px-8 text-base font-semibold">
              <a href="#productos">Explorar productos <ArrowRight className="ml-2 h-4 w-4" /></a>
            </Button>
            <Button onClick={() => { trackWhatsAppClick({ source: 'hero' }); openWhatsApp({ number: settings?.whatsappNumber, message: settings?.whatsappMessage }) }} size="lg" variant="outline" className="glass border-white/15 hover:bg-white/5 h-13 px-8 text-base font-medium gap-2">
              <MessageCircle className="h-4 w-4" /> Contactar por WhatsApp
            </Button>
          </div>
          <div className="mt-10 flex items-center gap-8 text-white/50 text-sm">
            <div><span className="text-white font-semibold text-2xl">40K</span><br />Puffs máx.</div>
            <div className="h-8 w-px bg-white/10" />
            <div><span className="text-white font-semibold text-2xl">24/7</span><br />WhatsApp</div>
            <div className="h-8 w-px bg-white/10" />
            <div><span className="text-white font-semibold text-2xl">100%</span><br />Original</div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }} className="relative">
          <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="relative aspect-square max-w-lg mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 blur-3xl rounded-full" />
            <img src={heroImg} alt="device" className="relative w-full h-full object-cover rounded-3xl border border-white/10 subtle-glow" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function ProductCard({ product, settings }) {
  const soldOut = product.stock === 0
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="glass border-white/8 overflow-hidden group h-full flex flex-col card-hover">
        <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden bg-zinc-950">
          <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1545095088-26a59e3f2717?w=600'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.tag && <Badge className="bg-gradient-to-b from-zinc-200 to-zinc-400 text-black border-0 font-medium text-[10px]">{product.tag}</Badge>}
            {discount > 0 && <Badge className="bg-black/75 backdrop-blur-md always-white border border-white/10 font-medium text-[10px]">-{discount}%</Badge>}
          </div>
          {product.puffs && <Badge className="absolute top-3 right-3 glass border-white/10 text-white/90 text-[10px]">{(product.puffs/1000)}K puffs</Badge>}
          {soldOut && <div className="absolute inset-0 bg-black/70 flex items-center justify-center"><Badge variant="destructive" className="text-sm">AGOTADO</Badge></div>}
        </Link>
        <div className="p-4 flex flex-col flex-1">
          <div className="text-[11px] text-white/50 uppercase tracking-wider mb-1">{product.categoryName}</div>
          <Link href={`/products/${product.slug}`}><h3 className="font-semibold text-white hover:text-white/80 transition-colors line-clamp-1">{product.name}</h3></Link>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-lg font-semibold text-white">${product.price}</span>
            {product.oldPrice && <span className="text-sm text-white/40 line-through">${product.oldPrice}</span>}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs">
            <span className={`h-1.5 w-1.5 rounded-full ${soldOut ? 'bg-red-500' : product.stockStatus === 'ultimas-unidades' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
            <span className="text-white/50">{soldOut ? 'Agotado' : product.stockStatus === 'ultimas-unidades' ? 'Últimas unidades' : 'Disponible'}</span>
          </div>
          <div className="flex gap-2 mt-4">
            <Button asChild size="sm" variant="outline" className="flex-1 border-white/10 hover:bg-white/5 text-xs"><Link href={`/products/${product.slug}`}>Ver detalles</Link></Button>
            <Button size="sm" onClick={() => { const url = window.location.origin; trackWhatsAppClick({ productId: product.id, productName: product.name, source: 'card' }); openWhatsApp({ number: settings?.whatsappNumber, message: buildProductMessage(product, url) }) }} className="btn-primary-tesla text-xs px-3"><MessageCircle className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function FeaturedSlider({ items, settings }) {
  const [idx, setIdx] = useState(0)
  const perView = 3
  const maxIdx = Math.max(0, items.length - perView)
  useEffect(() => {
    if (items.length <= perView) return
    const t = setInterval(() => setIdx(i => (i >= maxIdx ? 0 : i + 1)), 5000)
    return () => clearInterval(t)
  }, [items.length, maxIdx])

  return (
    <section id="destacados" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <Badge className="glass border-white/10 text-white/70 mb-3 font-normal">Destacados</Badge>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Lo más <span className="gradient-text">popular</span></h2>
          </div>
          <div className="hidden md:flex gap-2">
            <Button variant="outline" size="icon" className="glass border-white/10" onClick={() => setIdx(i => Math.max(0, i - 1))}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="glass border-white/10" onClick={() => setIdx(i => Math.min(maxIdx, i + 1))}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="overflow-hidden">
          <motion.div className="flex gap-6" animate={{ x: `-${idx * (100 / perView)}%` }} transition={{ type: 'spring', stiffness: 100, damping: 20 }} drag="x" dragConstraints={{ left: -1000, right: 0 }}>
            {items.map(p => (
              <div key={p.id} className="shrink-0 w-full md:w-1/2 lg:w-1/3">
                <ProductCard product={p} settings={settings} />
              </div>
            ))}
          </motion.div>
        </div>
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: maxIdx + 1 }).map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`h-1 rounded-full transition-all ${i === idx ? 'w-8 bg-white' : 'w-1 bg-white/20'}`} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Categories({ categories, onFilter }) {
  return (
    <section id="categorias" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="glass border-white/10 text-white/70 mb-3 font-normal">Categorías</Badge>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Explora por <span className="gradient-text">categoría</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {categories.filter(c => c.active).map((c, i) => (
            <motion.button key={c.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }} onClick={() => onFilter(c.id)} className="relative group aspect-[16/10] rounded-2xl overflow-hidden glass border-white/10">
              <img src={c.image} alt={c.name} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-left">
                <h3 className="font-semibold text-3xl text-white mb-2">{c.name}</h3>
                <p className="text-sm text-white/70 line-clamp-2 mb-3">{c.description}</p>
                <div className="text-sm text-white flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">Ver productos <ArrowRight className="h-3.5 w-3.5" /></div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}

function Catalog({ products, categories, settings, searchQuery, catFilter, setCatFilter, loading }) {
  const [priceRange, setPriceRange] = useState([0, 55])
  const [puffsRange, setPuffsRange] = useState([0, 40000])
  const [applyPuffs, setApplyPuffs] = useState(false)
  const [availability, setAvailability] = useState('all')
  const [sort, setSort] = useState('featured')

  const filtered = useMemo(() => {
    let list = [...products]
    if (searchQuery) list = list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    if (catFilter && catFilter !== 'all') list = list.filter(p => p.categoryId === catFilter)
    list = list.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    if (applyPuffs) list = list.filter(p => (p.puffs || 0) >= puffsRange[0] && (p.puffs || 0) <= puffsRange[1])
    if (availability === 'available') list = list.filter(p => p.stock > 0)
    if (availability === 'sold') list = list.filter(p => p.stock === 0)
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    else if (sort === 'newest') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    else if (sort === 'puffs-desc') list.sort((a, b) => (b.puffs || 0) - (a.puffs || 0))
    else list.sort((a, b) => (b.featured - a.featured))
    return list
  }, [products, searchQuery, catFilter, priceRange, availability, sort, applyPuffs, puffsRange])

  return (
    <section id="productos" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="glass border-white/10 text-white/70 mb-3 font-normal">Catálogo completo</Badge>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Todos los <span className="gradient-text">productos</span></h2>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          <aside className="space-y-6 glass rounded-2xl p-6 border-white/10 h-fit lg:sticky lg:top-24">
            <div>
              <div className="text-sm font-semibold mb-3">Categoría</div>
              <Select value={catFilter} onValueChange={setCatFilter}>
                <SelectTrigger className="glass border-white/10"><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent className="glass-strong border-white/10">
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="text-sm font-semibold mb-3">Precio: ${priceRange[0]} - ${priceRange[1]}</div>
              <Slider min={0} max={55} step={1} value={priceRange} onValueChange={setPriceRange} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold">Puffs: {puffsRange[0].toLocaleString()} - {puffsRange[1].toLocaleString()}</div>
                <button onClick={() => setApplyPuffs(v => !v)} className={`text-[10px] px-2 py-0.5 rounded-full border ${applyPuffs ? 'bg-white text-black border-white' : 'border-white/20 text-white/60'}`}>{applyPuffs ? 'ON' : 'OFF'}</button>
              </div>
              <Slider min={0} max={40000} step={500} value={puffsRange} onValueChange={(v) => { setPuffsRange(v); setApplyPuffs(true) }} />
              <div className="text-[11px] text-white/40 mt-1">Rango 0 – 40,000 puffs</div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-3">Disponibilidad</div>
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger className="glass border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent className="glass-strong border-white/10">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="available">Disponibles</SelectItem>
                  <SelectItem value="sold">Agotados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="text-sm font-semibold mb-3">Ordenar por</div>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="glass border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent className="glass-strong border-white/10">
                  <SelectItem value="featured">Destacados</SelectItem>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="price-asc">Precio: menor</SelectItem>
                  <SelectItem value="price-desc">Precio: mayor</SelectItem>
                  <SelectItem value="puffs-desc">Puffs: mayor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="w-full glass border-white/10" onClick={() => { setCatFilter('all'); setPriceRange([0, 55]); setPuffsRange([0, 40000]); setApplyPuffs(false); setAvailability('all'); setSort('featured') }}>Limpiar filtros</Button>
          </aside>

          <div>
            <div className="text-sm text-white/50 mb-4">{filtered.length} productos</div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl bg-white/5" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {filtered.map(p => <ProductCard key={p.id} product={p} settings={settings} />)}
              </div>
            )}
            {!loading && filtered.length === 0 && <div className="text-center text-white/40 py-20">No hay productos con estos filtros.</div>}
          </div>
        </div>
      </div>
    </section>
  )
}

function Benefits() {
  const items = [
    { icon: ShieldCheck, title: 'Productos seleccionados', text: 'Solo marcas y modelos verificados por nuestro equipo.' },
    { icon: Zap, title: 'Atención rápida', text: 'Respuestas por WhatsApp en minutos, no en horas.' },
    { icon: Package, title: 'Stock actualizado', text: 'Catálogo sincronizado en tiempo real.' },
    { icon: Headphones, title: 'Soporte por WhatsApp', text: 'Asesoría personalizada antes y después de tu compra.' },
  ]
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((it, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }}>
              <Card className="glass border-white/8 p-6 h-full">
                <div className="h-11 w-11 rounded-lg silver-icon flex items-center justify-center mb-4">
                  <it.icon className="h-5 w-5 text-zinc-200" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{it.title}</h3>
                <p className="text-sm text-white/55">{it.text}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PromoBanner({ banner }) {
  if (!banner || !banner.active) return null
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-r ${banner.gradient} p-8 md:p-16 border border-white/10`}>
          <div className="absolute inset-0 opacity-25"><img src={banner.image} alt="" className="w-full h-full object-cover" /></div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-semibold always-white mb-4">{banner.title}</h2>
            <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.82)' }}>{banner.text}</p>
            <Button asChild size="lg" className="bg-white text-black hover:bg-zinc-100 font-semibold">
              <a href={banner.link}>{banner.buttonText} <ArrowRight className="ml-2 h-4 w-4" /></a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer({ settings }) {
  return (
    <footer id="contacto" className="border-t border-white/5 mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-b from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center"><Wind className="h-5 w-5 text-zinc-100" /></div>
              <span className="font-semibold text-lg">{settings?.storeName || 'Cloud District'}</span>
            </div>
            <p className="text-sm text-white/55 max-w-xs">{settings?.footerText}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm text-white/55">
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0" />{settings?.address}</li>
              <li className="flex items-start gap-2"><Clock className="h-4 w-4 mt-0.5 shrink-0" />{settings?.hours}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Síguenos</h4>
            <div className="flex gap-3">
              <a href={settings?.instagram} target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full glass border-white/10 flex items-center justify-center hover:bg-white/10"><Instagram className="h-4 w-4" /></a>
              <a href={settings?.facebook} target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full glass border-white/10 flex items-center justify-center hover:bg-white/10"><Facebook className="h-4 w-4" /></a>
              <a href={settings?.tiktok} target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full glass border-white/10 flex items-center justify-center hover:bg-white/10 text-xs font-bold">TT</a>
              <button onClick={() => { trackWhatsAppClick({ source: 'footer' }); openWhatsApp({ number: settings?.whatsappNumber, message: settings?.whatsappMessage }) }} className="h-10 w-10 rounded-full btn-primary-tesla flex items-center justify-center"><MessageCircle className="h-4 w-4" /></button>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-white/55">
              <li>Solo para mayores de {settings?.minAge || 18} años</li>
              <li><a href="#" className="hover:text-white">Términos y condiciones</a></li>
              <li><a href="#" className="hover:text-white">Política de privacidad</a></li>
              <li><Link href="/admin" className="hover:text-white text-xs text-white/40">Admin</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 mt-12 pt-6 text-xs text-white/35 text-center">
          © {new Date().getFullYear()} {settings?.storeName}. {settings?.legalNotice}
        </div>
      </div>
    </footer>
  )
}

function WhatsAppFloat({ settings }) {
  return (
    <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 }} onClick={() => { trackWhatsAppClick({ source: 'float' }); openWhatsApp({ number: settings?.whatsappNumber, message: settings?.whatsappMessage }) }} className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full btn-primary-tesla flex items-center justify-center">
      <MessageCircle className="h-6 w-6" />
    </motion.button>
  )
}

function App() {
  const [ageOk, setAgeOk] = useState(false)
  const [settings, setSettings] = useState(null)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [slider, setSlider] = useState([])
  const [banner, setBanner] = useState(null)
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [catFilter, setCatFilter] = useState('all')

  useEffect(() => {
    if (!ageOk) return
    async function load() {
      try {
        const [s, c, p, sl, b, f] = await Promise.all([
          apiFetch('/settings'),
          apiFetch('/categories'),
          apiFetch('/products'),
          apiFetch('/products?slider=1'),
          apiFetch('/banners'),
          apiFetch('/products?featured=1')
        ])
        setSettings(s); setCategories(c); setProducts(p); setSlider(sl); setBanner(b.find(x => x.active) || b[0]); setFeatured(f)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [ageOk])

  if (!ageOk) return <AgeGate onConfirm={() => setAgeOk(true)} />

  return (
    <div className="min-h-screen radial-bg">
      <Header settings={settings} onSearch={setSearchQuery} searchQuery={searchQuery} />
      <Hero settings={settings} />
      {slider.length > 0 && <FeaturedSlider items={slider} settings={settings} />}
      <Categories categories={categories} onFilter={(id) => { setCatFilter(id); document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' }) }} />
      <Catalog products={products} categories={categories} settings={settings} searchQuery={searchQuery} catFilter={catFilter} setCatFilter={setCatFilter} loading={loading} />
      {featured.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="glass border-white/10 text-white/70 mb-3 font-normal">Selección del equipo</Badge>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Productos <span className="gradient-text">destacados</span></h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featured.slice(0, 8).map(p => <ProductCard key={p.id} product={p} settings={settings} />)}
            </div>
          </div>
        </section>
      )}
      <Benefits />
      <PromoBanner banner={banner} />
      <Footer settings={settings} />
      <WhatsAppFloat settings={settings} />
    </div>
  )
}

export default App
