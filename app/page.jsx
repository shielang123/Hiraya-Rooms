"use client"
import { useEffect, useState } from "react"
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth"
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore"
import { DoorOpen, Plus, Pencil, Trash2, LogIn, LogOut } from "lucide-react"
import { toast, Toaster } from "sonner"
import { auth, db, googleProvider } from "@/lib/firebase"
import { AddRoomModal } from "@/components/admin/add-room-modal"
import { PreviewRoomModal } from "@/components/admin/preview-room-modal"

export default function RoomsManagementPage() {
 const [user,setUser]=useState(null),[authLoading,setAuthLoading]=useState(true),[rooms,setRooms]=useState([]),[loading,setLoading]=useState(false)
 const [addOpen,setAddOpen]=useState(false),[editing,setEditing]=useState(null),[previewOpen,setPreviewOpen]=useState(false)
 useEffect(()=>{if(!auth)return;return onAuthStateChanged(auth,u=>{setUser(u);setAuthLoading(false)})},[])
 useEffect(()=>{if(!user){setRooms([]);return}setLoading(true);return onSnapshot(query(collection(db,"rooms"),where("ownerUid","==",user.uid)),snap=>{setRooms(snap.docs.map(d=>({id:d.id,...d.data()})));setLoading(false)},e=>{console.error(e);toast.error("Could not load rooms. Check Firebase setup and rules.");setLoading(false)})},[user])
 const fields=p=>({name:p.name,roomNumber:p.number,type:p.type,description:p.description,price:Number(p.price)||0,discount:Number(p.discount)||0,maxGuests:Number(p.maxGuests)||1,bedType:p.bedType,beds:Number(p.beds)||1,amenities:p.amenities,availability:p.availability,featured:Boolean(p.featured),images:p.images})
 const saveRoom=async p=>{try{await addDoc(collection(db,"rooms"),{...fields(p),ownerUid:user.uid,createdAt:serverTimestamp()});toast.success("Room added");setAddOpen(false)}catch(e){console.error(e);toast.error("Failed to save room");throw e}}
 const updateRoom=async p=>{try{await updateDoc(doc(db,"rooms",p.id),{...fields(p),updatedAt:serverTimestamp()});toast.success("Room updated");setPreviewOpen(false);setEditing(null)}catch(e){console.error(e);toast.error("Failed to update room");throw e}}
 const removeRoom=async r=>{if(!confirm(`Delete "${r.name}"? This cannot be undone.`))return;try{await deleteDoc(doc(db,"rooms",r.id));toast.success("Room deleted")}catch(e){console.error(e);toast.error("Failed to delete room")}}
 if(authLoading)return <main className="center-screen">Checking sign-in…</main>
 if(!user)return <main className="center-screen"><Toaster richColors/><section className="login-card"><div className="brand-icon"><DoorOpen size={30}/></div><h1>Rooms Management</h1><p>Sign in to manage your resort rooms.</p><button className="primary-btn" onClick={async()=>{try{await signInWithPopup(auth,googleProvider)}catch(e){toast.error(e.message)}}}><LogIn size={18}/> Sign in with Google</button><small>Enable Google sign-in in your Firebase project.</small></section></main>
 return <main className="page-shell"><Toaster richColors position="top-right"/><header className="topbar"><div className="brand"><div className="brand-icon"><DoorOpen/></div><div><h1>Rooms Management</h1><p>Resort inventory dashboard</p></div></div><div className="user-area"><span>{user.displayName||user.email}</span><button className="secondary-btn" onClick={()=>signOut(auth)}><LogOut size={16}/> Sign out</button></div></header>
 <section className="intro"><div><p className="eyebrow">ROOM INVENTORY</p><h2>Manage your rooms</h2><p className="muted">Add, edit, preview, and manage room details and availability.</p></div><button className="primary-btn" onClick={()=>setAddOpen(true)}><Plus size={18}/> Add room</button></section>
 <section className="stats"><div><span>Total rooms</span><strong>{rooms.length}</strong></div><div><span>Available</span><strong>{rooms.filter(r=>(r.availability||"Available")==="Available").length}</strong></div><div><span>Other status</span><strong>{rooms.filter(r=>r.availability&&r.availability!=="Available").length}</strong></div></section>
 {loading?<div className="empty">Loading rooms…</div>:rooms.length===0?<div className="empty"><DoorOpen size={38}/><h3>No rooms yet</h3><p>Add your first room to begin managing inventory.</p><button className="primary-btn" onClick={()=>setAddOpen(true)}><Plus size={18}/> Add your first room</button></div>:<section className="room-grid">{rooms.map(r=><article className="room-card" key={r.id}>{r.images?.[0]?<img className="room-image" src={r.images[0]} alt={r.name}/>:<div className="room-image image-placeholder"><DoorOpen size={36}/></div>}<div className="room-content"><div className="room-heading"><div><h3>{r.name}</h3><p>{r.type} · Room {r.roomNumber||"—"}</p></div><span className="status">{r.availability||"Available"}</span></div><p className="description">{r.description||"No description provided."}</p><div className="price-row"><strong>₱{Number(r.price||0).toLocaleString()}</strong><span>per night</span><span className="guests">{r.maxGuests||1} guests</span></div><div className="amenities">{(r.amenities||[]).slice(0,4).map(a=><span key={a}>{a}</span>)}</div><div className="actions"><button className="secondary-btn" onClick={()=>{setEditing(r);setPreviewOpen(true)}}><Pencil size={16}/> Edit details</button><button className="danger-btn" onClick={()=>removeRoom(r)}><Trash2 size={16}/> Delete</button></div></div></article>)}</section>}
 <footer>Room records are stored in the Firestore <code>rooms</code> collection.</footer>
 <AddRoomModal open={addOpen} onClose={()=>setAddOpen(false)} onSave={saveRoom} duplicateScopeOwnerUid={user.uid}/>
 <PreviewRoomModal open={previewOpen} room={editing} onClose={()=>{setPreviewOpen(false);setEditing(null)}} onSave={updateRoom}/>
 </main>
}
