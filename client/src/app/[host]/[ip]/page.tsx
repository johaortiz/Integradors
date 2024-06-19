"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const DetailsDevice = () => {
    const params = useParams();
    const { id } = params;
    const [device, setDevice] = useState<any>(null);
    const [backups, setBackups] = useState<any[]>([]);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

    const fetchDeviceDetails = async () => {
        try {
            const response = await fetch(`http://localhost:3000/devices/${id}`);
            const data = await response.json();
            setDevice(data);
        } catch (error) {
            console.error('Error fetching device details:', error);
        }
    };

    const fetchBackups = async () => {
        try {
            const response = await fetch(`http://localhost:3000/devices/${id}/backups`);
            const data = await response.json();
            setBackups(data);
        } catch (error) {
            console.error('Error fetching backups:', error);
        }
    };

    const createBackup = async () => {
        try {
            const response = await fetch(`http://localhost:3000/devices/${id}/backups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                startCountdown();
            } else {
                console.error('Error creating backup:', await response.text());
            }
        } catch (error) {
            console.error('Error creating backup:', error);
        }
    };

    const startCountdown = () => {
        setCountdown(7);
        setRefreshMessage('La página se actualizará en 7 segundos...');
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev === 1) {
                    clearInterval(interval);
                    window.location.reload();
                }
                return prev ? prev - 1 : null;
            });
        }, 1000);
    };

    const refreshNow = () => {
        window.location.reload();
    };

    useEffect(() => {
        if (id) {
            fetchDeviceDetails();
            fetchBackups();
        }
    }, [id]);

    if (!device) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Detalles del Dispositivo</h1>
            <p><strong>Host:</strong> {device.host}</p>
            <p><strong>IP:</strong> {device.ip}</p>
            <p><strong>Nombre:</strong> {device.name}</p>
            <p><strong>Usuario:</strong> {device.username}</p>
            <p><strong>Contraseña:</strong> {device.password}</p>
            <p><strong>Conectado:</strong> {device.isConnected ? 'Sí' : 'No'}</p>
            <button
                onClick={createBackup}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-700 duration-150 mt-4"
            >
                Crear Backup
            </button>
            {refreshMessage && (
                <div className="mt-4">
                    <p>{refreshMessage}</p>
                    <button
                        onClick={refreshNow}
                        className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-700 duration-150 mt-2"
                    >
                        Refrescar Ahora
                    </button>
                </div>
            )}
            <h2 className="text-xl font-semibold mt-4">Información de Backups</h2>
            {backups.length > 0 ? (
                <ul>
                    {backups.map((backup) => (
                        <li key={backup.id}>
                            <p><strong>Nombre:</strong> {backup.name}</p>
                            <p><strong>Fecha:</strong> {new Date(backup.date).toLocaleString()}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No hay backups disponibles.</p>
            )}
        </div>
    );
};

export default DetailsDevice;
