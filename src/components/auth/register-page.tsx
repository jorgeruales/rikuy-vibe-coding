"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function RegisterPage({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedPin, setGeneratedPin] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Generate 4-digit PIN
            const pin = Math.floor(1000 + Math.random() * 9000).toString();

            // Save user with PIN in Firestore
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                pin: pin,
                createdAt: new Date().toISOString()
            });

            setGeneratedPin(pin);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Error al registrar usuario.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-dvh w-full items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
                    <CardDescription>
                        Regístrate para obtener tu PIN de acceso para el control de gastos.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                    <CardContent className="space-y-4">
                        {error && <div className="text-sm text-red-500">{error}</div>}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Registrando..." : "Registrar"}
                        </Button>
                        <Button type="button" variant="link" onClick={onSwitchToLogin} className="w-full">
                            Ya tengo un PIN. Ingresar
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <Dialog open={!!generatedPin} onOpenChange={(open) => {
                if (!open) {
                    setGeneratedPin(null);
                    onSwitchToLogin(); // Go to login after closing pin dialog
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>¡Registro Exitoso!</DialogTitle>
                        <DialogDescription>
                            Este es tu PIN único de 4 dígitos. Guárdalo bien, lo necesitarás para entrar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center p-6">
                        <div className="text-5xl font-mono font-bold tracking-[0.5em] text-primary bg-muted p-4 rounded-xl border">
                            {generatedPin}
                        </div>
                    </div>
                    <Button onClick={() => {
                        setGeneratedPin(null);
                        onSwitchToLogin();
                    }} className="w-full">
                        Entendido, ir al login
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}
