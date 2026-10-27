-- La señal de tiempo real se omite si Realtime todavía no creó realtime.send.
-- Pasa en Supabase local mientras carga los datos de prueba, antes de que arranque el servicio
-- Realtime. En la nube la función siempre existe, así que la señal siempre sale.
create or replace function privado.senal_fila()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_fila jsonb := to_jsonb(coalesce(new, old));
  v_barberia text := case when tg_table_name = 'barberias' then v_fila ->> 'id' else v_fila ->> 'barberia_id' end;
begin
  if to_regprocedure('realtime.send(jsonb, text, text, boolean)') is not null then
    perform realtime.send('{}'::jsonb, 'cambio', 'fila:' || v_barberia, false);
  end if;
  return null;
end;
$$;

revoke execute on function privado.senal_fila() from public, anon, authenticated;
