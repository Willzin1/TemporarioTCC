@extends('templates.master')

@section('content')
    <div class="containerGerente">

        @include('includes.aside')
        <section id="reservas">
            <h2>Gerenciar Cardápio</h2>
            <div class="reservas-tabela">
            <a href="{{ route('admin.cardapio.create') }}" class="btn btn-primary">Adicionar Prato</a>

            <table class="table">
                <thead>
                    <tr>
                        <th>Imagem</th>
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th>Categoria</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($pratos as $prato)
                        <tr>
                            <td><img src="{{ asset($prato->imagem ? 'storage/' . $prato->imagem : 'assets/images/pudimCaramelo1.png') }}" width="50"></td>
                            <td>{{ $prato->nome }}</td>
                            <td>{{ $prato->descricao }}</td>
                            <td>{{ ucfirst($prato->categoria) }}</td>
                            <td>
                                <a href="{{ route('admin.cardapio.edit', ['prato' => $prato->id]) }}" class="btn btn-warning">Editar</a>
                                <form action="{{ route('admin.cardapio.destroy', ['prato' => $prato->id]) }}" method="POST">
                                    @csrf
                                    @method('DELETE')
                                    <button class="btn btn-danger">Excluir</button>
                                </form>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </section>
    </div>
@endsection
