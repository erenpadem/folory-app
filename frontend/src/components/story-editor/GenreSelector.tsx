import React, { useState } from 'react'
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function GenreSelector() {
    const [genre, setGenre] = useState('fantasy')
    return (
        <div className="space-y-2" >
            <Label>Tür</Label>
            <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger>
                    <SelectValue placeholder="Tür seçin" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="fantasy">Fantastik</SelectItem>
                    <SelectItem value="sci-fi">Bilim Kurgu</SelectItem>
                    <SelectItem value="romance">Romantik</SelectItem>
                    <SelectItem value="horror">Korku</SelectItem>
                    <SelectItem value="mystery">Gizem</SelectItem>
                    <SelectItem value="adventure">Macera</SelectItem>
                </SelectContent>
            </Select>
        </div >
    )
}

